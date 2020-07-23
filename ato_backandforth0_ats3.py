import atovrmnxclient as vc
import time


client = vc.Client()

ats1Bi = vc.ATS(client, (81, 91, 101))
ats2o = vc.ATS(client, (87, 97, 107))

point1 = vc.Point(client, 73)

train2 = vc.Train(client, 40)


def sequence(train):
    train.stop(550)
    train.Turn()
    time.sleep(3)
    train.start(400)


ats1Bi.forward = sequence
ats2o.reverse = sequence


def main():
    thread = client.connect()

    point1.SetBranch(1)
    train2.start(400)

    thread.join()
    

if __name__ == '__main__':
    main()
