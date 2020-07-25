import time

import atovrmnxclient as vc


client = vc.Client()

ats1Ai = vc.ATS(client, 80)
ats1Ao = vc.ATS(client, 81)
ats2i = vc.ATS(client, 86)
ats2o = vc.ATS(client, 87)

train1 = vc.Train(client, 39)


def sequence1(train):
    train.stop(550)
    time.sleep(3)
    train.start(400)


def sequence2(train):
    train.stop(550)
    train.Turn()
    time.sleep(3)
    train.start(400)


ats1Ai.forward = sequence1
ats1Ao.reverse = sequence1
ats2i.forward = sequence2
ats2o.reverse = sequence2


def main():
    thread = client.connect()

    train1.start(400)

    thread.join()


if __name__ == '__main__':
    main()
