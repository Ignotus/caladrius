from torch.optim import Adam
from sklearn.metrics import f1_score
from torch.nn.modules import loss as nnloss
import torchvision.transforms as transforms

from evaluate import RollingEval
from siamese_network import build_net


from network import get_pretrained_iv3_transforms, SiameseNetwork
from siamese_network import build_net, get_transforms


class QuasiSiameseNetwork(object):

    def __init__(self, train_config, net_config, input_size, n_freeze=7):
        assert train_config in ("soft-targets", "softmax")
        assert net_config in ("pre-trained", "full")
        self.train_config = train_config
        self.input_size = input_size

        if train_config == "soft-targets":
            self.n_classes = 1
            self.criterion = nnloss.BCEWithLogitsLoss()
        else:
            # TODO: weights
            self.n_classes = 4
            self.criterion = nnloss.CrossEntropyLoss()

        self.transforms = {}
        if net_config == "pre-trained":
            self.model = SiameseNetwork(self.n_classes, n_freeze=n_freeze)

            for s in ("train", "val", "test"):
                self.transforms[s] = get_pretrained_iv3_transforms(s)

        else:
            self.model = build_net(input_size, self.n_classes)
            assert input_size[0] == input_size[1]
            for s in ("train", "val", "test"):
                self.transforms[s] = get_transforms(s, input_size[0])

        log.debug("Num params: {}".format(
            len([_ for _ in self.model.parameters()])))

        self.optimizer = Adam(self.model.parameters())

    def run_epoch(self, epoch, loader, device, phase="train"):
        assert phase in ("train", "val", "test")

        self.model = self.model.to(device)

        log.info("Phase: {}, Epoch: {}".format(phase, epoch))

        if phase == 'train':
            self.model.train()  # Set model to training mode
        else:
            self.model.eval()

        running_loss = 0.0
        running_corrects = 0
        running_n = 0.0

        rolling_eval = RollingEval()

        for idx, (image1, image2, labels) in enumerate(loader):
            image1 = image1.to(device)
            image2 = image2.to(device)
            labels = labels.to(device)

            if phase == "train":
                # zero the parameter gradients
                self.optimizer.zero_grad()

            with torch.set_grad_enabled(phase == "train"):
                outputs = self.model(image1, image2)
                _, preds = torch.max(outputs, 1)
                _, labels = torch.max(labels, 1)
                loss = self.criterion(outputs, labels)

                if phase == 'train':
                    loss.backward()
                    self.optimizer.step()

                rolling_eval.add(labels, preds)

            running_loss += loss.item() * image1.size(0)
            running_corrects += torch.sum(preds == labels.data)
            running_n += image1.size(0)

            if idx % 10 == 0:
                log.info("\tBatch {}: Loss: {:.4f} Acc: {:.4f} F1: {:.4f}".format(
                    idx, running_loss / running_n, running_corrects.double() / running_n, rolling_eval.f1_score()))

        epoch_loss = running_loss / running_n
        epoch_acc = running_corrects.double() / \
            running_n
        epoch_f1 = rolling_eval.f1_score()

        log.info('{}: Loss: {:.4f} Acc: {:.4f} F1:{:.4f}'.format(
            phase, epoch_loss, epoch_acc, epoch_f1))

        return epoch_loss, epoch_acc, epoch_f1

    def train(self, n_epochs, datasets, device, save_path):
        train_set, train_loader = datasets.load("train")
        #val_set, val_loader = datasets.load("val")

        best_f1, best_model_wts = 0.0, copy.deepcopy(
            self.model.state_dict())

        start_time = time.time()
        for epoch in range(n_epochs):
            # train network
            train_loss, train_acc, train_f1 = self.run_epoch(
                epoch, train_loader, device, phase="train")

            # eval on validation
            #self.run_epoch(epoch, loader, device, phase="val")

            # TODO: change when you get validation accuracy
            val_f1 = train_f1

            if val_f1 > best_f1:
                best_f1 = val_f1
                best_model_wts = copy.deepcopy(self.model.state_dict())

                log.info("Checkpoint: Saving to {}".format(save_path))
                torch.save(best_model_wts, save_path)

        time_elapsed = time.time() - start_time
        log.info('Training complete in {:.0f}m {:.0f}s'.format(
            time_elapsed // 60, time_elapsed % 60))

        log.info('Best val F1: {:4f}.'.format(best_f1))

    def test(self, datasets, device):
        pass
