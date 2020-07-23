import atovrmnxclient as vc
import time


client = vc.Client()

ats1Bi = vc.ATS(client, 81)
ats2i = vc.ATS(client, 86)

point1 = vc.Point(client, 73)
point2 = vc.Point(client, 74)

train2 = vc.Train(client, 40)


def sequence(train):
    train.stop(550)
    time.sleep(3)
    train.start(400)


ats1Bi.forward = sequence
ats2i.forward = sequence


def main():
    thread = client.connect()

    point1.SetBranch(1)
    point2.SetBranch(1)
    train2.start(400)

    thread.join()
    

if __name__ == '__main__':
    main()
