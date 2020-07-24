import time

import atovrmnxclient as vc


client = vc.Client()

ats1Ai = vc.ATS(client, 80)
ats2i = vc.ATS(client, 86)

train1 = vc.Train(client, 39)


def sequence(train):
    train.stop(550)
    time.sleep(3)
    train.start(400)


ats1Ai.forward = sequence
ats2i.forward = sequence


def main():
    thread = client.connect()

    train1.start(400)

    thread.join()
    

if __name__ == '__main__':
    main()
