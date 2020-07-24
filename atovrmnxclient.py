"""VRM-NX用サーバーモジュールatovrmnxserverに接続するクライアントモジュール

    クラス:
        Client: VRM-NXに追加したサーバーに接続するクライアントのクラス
        ATS: VRMATSに対応するクラス
        Point: VRMPointに対応するクラ
        Train: VRMTrainに対応するクラス
        Platform: 駅のプラットフォームのクラス
        Section: 閉塞区間のクラス
        Station: プラットホームを管理する駅のクラス

    関数:
        cleartimetable(): sucheduleモジュールをクリアして発車時刻の登録準備をする。
        readtimetable(): 時刻表の文字列を解釈して各駅の発車時刻をsucheduleモジュールに登録する。
"""
import socket
import threading
import time
import schedule
import re
import datetime


class VRMCommunicationError(Exception):
    """サーバー接続関連の例外"""
    pass


class VRMInvalidParameterError(Exception):
    """パラメータ関連の例外"""
    pass


class Client(object):
    """VRM-NX用サーバーモジュールatovrmnxserverに接続するクライアントのクラス"""

    _ATSEventHandlerName = 'vrmevent_userats'

    def __init__(self):
        self._atsdict = {}
        self._pointdict = {}
        self._traindict = {}
        self._sequencedict = {}
        self._ignoreatslist = []
        self._lock = threading.Lock()
        self._commandsocket = None
        self._commandstream = None
        self._eventsocket = None
        self._eventstream = None

    def connect(self, address='127.0.0.1', commandport=54001, eventport=54002):
        """コマンド用とイベント用の２つのTCPソケットをサーバーに接続する。

        接続後イベント受信スレッドを開始する。
        
        Args:
            address (str): サーバーアドレス。
            commandport (int): コマンド用TCPソケットのポート番号。
            eventport (int): イベント用TCPソケットのポート番号。

        Returns:
            threading.Thread: イベント受信スレッド。
        """
        self._address = address
        self._commandport = commandport
        self._eventport = eventport
        
        self.disconnect()
        
        # コマンド用とイベント用の２つのTCPソケットをサーバーに接続
        self._opencommandsocket()
        self._openeventsocket()

        # 登録済みのATSオブジェクトに対応するサーバー側のVRMATSオブジェクトをイベント送信可能にする
        for ats in self._atsdict.values():
            ats.SetUserEventFunction(Client._ATSEventHandlerName)

        # 登録済みのTrainオブジェクトに対応するサーバー側のVRMTrainオブジェクトに種別コードと列車番号を付ける
        for train in self._traindict.values():
            train.SetTrainCode()
            train.SetTrainNumber()

        # イベント受信スレッドを開始
        thread = threading.Thread(target=self._run, args=(address, eventport), daemon=True)
        thread.start()
        return thread

    def disconnect(self):
        """サーバーとの接続を切る。"""
        self._closeeventsocket()
        self._closecommandsocket()

    def send(self, command):
        """コマンド文字列をサーバーに送信する。

        Args:
            command (str): '\n'で終端されたコマンド文字列。
        """
        self._lock.acquire()
        try:
            if self._commandstream:
                #print(command)
                self._commandstream.write(command)
                self._commandstream.flush()
            else:
                raise VRMCommunicationError('接続されていません。')
        finally:
            self._lock.release()

    def sendquery(self, command):
        """コマンド文字列をサーバーに送信し、受信した応答文字列を返す。

        Args:
            command (str): '\n'で終端されたコマンド文字列。

        Returns:
            str: 受信した応答文字列（'\n'削除済み）。
        """
        self._lock.acquire()
        try:
            if self._commandstream:
                #print(f'{command.rstrip()} => ', end='')
                self._commandstream.write(command)
                self._commandstream.flush()
                try:
                    response = self._commandstream.readline().rstrip()
                    #print(response)
                    return response
                except socket.timeout as e:
                    print(f'sendquery: {e}')
                    self._closecommandsocket()
                    self._opencommandsocket()
            else:
                raise VRMCommunicationError('接続されていません。')
        finally:
            self._lock.release()

    def startthread(self, sequence, args=None):
        """関数を新しいスレッドで開始する。

        Args:
            sequence (str): スレッドで実行される関数。
            args (obj): 関数に渡される引数。タプルの場合はタプルの中身が複数の引数になる。
                例:
                    startthread(func, arg) => func(arg)
                    startthread(func, (arg1, arg2, arg3)) => func(arg1, arg2, arg3)
        """
        if args is None:
            thread = threading.Thread(target=sequence, daemon=True)
        elif isinstance(args, tuple):
            thread = threading.Thread(target=sequence, args=args, daemon=True)
        else:
            thread = threading.Thread(target=sequence, args=(args,), daemon=True)
        thread.start()

    def _register(self, vrmobject):
        if isinstance(vrmobject, ATS):
            self._atsdict[vrmobject.id] = vrmobject

            id = vrmobject.id            
            if isinstance(id, tuple): # 一か所に複数のATSを使う場合
                if len(id) < 2:
                    raise VRMInvalidParameterError('１つのATSだけの場合はタプルの代わりに整数で指定してください。')
                else:
                    # idが(40, 41, 42)の場合列車は40→41→42の順に検出されるので次のように登録する
                    # 辞書の値は(ATS, 自分より前のATSのリスト, 自分より後ろのATSのリスト)のタプル
                    # self._sequencedict[(40, 1)] = (vrmobject, [], [41, 42])
                    # self._sequencedict[(41, 1)] = (vrmobject, [40], [42])
                    # self._sequencedict[(42, 1)] = (vrmobject, [40, 41], [])
                    for i in range(len(id)):
                        self._sequencedict[(id[i], 1)] = (vrmobject, id[:i], id[i + 1:])

                    # idが(40, 41, 42)の場合列車は42→41→40の順に検出されるので次のように登録する
                    # self._sequencedict[(42, -1)] = (vrmobject, [], [41, 40])
                    # self._sequencedict[(41, -1)] = (vrmobject, [42], [40])
                    # self._sequencedict[(40, -1)] = (vrmobject, [42, 41], [])
                    id = tuple(reversed(id))
                    for i in range(len(id)):
                        self._sequencedict[(id[i], -1)] = (vrmobject, id[:i], id[i + 1:])
            else: # 一か所に１つのATSだけの場合
                # 辞書の値はATSのみ
                self._sequencedict[(id, 1)] = vrmobject
                self._sequencedict[(id, -1)] = vrmobject

            # 接続済みのときは、個別にサーバー側のVRMATSオブジェクトをイベント送信可能にする
            if self._commandstream:
                vrmobject.SetUserEventFunction(Client._ATSEventHandlerName)

        elif isinstance(vrmobject, Point):
            self._pointdict[vrmobject.id] = vrmobject

        elif isinstance(vrmobject, Train):
            self._traindict[vrmobject.id] = vrmobject
            # 接続済みのときは、個別にサーバー側のVRMTrainオブジェクトに種別コードと列車番号を付ける
            if self._commandstream:
                vrmobject.SetTrainCode()
                vrmobject.SetTrainNumber()

        else:
            raise VRMInvalidParameterError('登録対象ではありません。')       

    def _closecommandsocket(self):
        if self._commandsocket:
            self._commandsocket.close()
            self._commandsocket = None
            self._commandstream = None

    def _closeeventsocket(self):
        if self._eventsocket:
            self._eventsocket.close()
            self._eventsocket = None
            self._eventstream = None
        
    def _opencommandsocket(self):
        print(f'connecting to {self._address}:{self._commandport}')
        self._commandsocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._commandsocket.settimeout(3.0)
        self._commandsocket.connect((self._address, self._commandport))
        self._commandstream = self._commandsocket.makefile(mode='rw')
        print('connected')
        
    def _openeventsocket(self):
        print(f'connecting to {self._address}:{self._eventport}')
        self._eventsocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._eventsocket.connect((self._address, self._eventport))
        self._eventstream = self._eventsocket.makefile(mode='rw')
        print('connected')

    def _run(self, address, eventport):
        while self._eventstream:
            event = self._eventstream.readline().rstrip()
            if event:
                self._executeevent(event)

    def _executeevent(self, event):
        lst = event[len('catch '):].split()
        atsid = int(lst[0])
        trainid = int(lst[1])
        direction = int(lst[2])
        if trainid not in self._traindict:
            return
        key = (atsid, direction)
        if key not in self._sequencedict:
            return

        value = self._sequencedict[key]
        if isinstance(value, tuple):
            ats = value[0]
            preids = value[1]
            postids = value[2]

            if (atsid, trainid) in self._ignoreatslist:
                # このATSの項目を_ignoreatslistから削除
                self._ignoreatslist.remove((atsid, trainid))
                # このATSより前の項目は古いので_ignoreatslistから削除
                for ignoreatsid in preids:
                    if (ignoreatsid, trainid) in self._ignoreatslist:
                        self._ignoreatslist.remove((ignoreatsid, trainid))
                return            
            if preids: # このATSより前の見逃したATSがあれば表示
                print(f'{preids} ', end='')
            # 同じtrainidの項目は古いので_ignoreatslistから削除
            for ignoreats in [x for x in self._ignoreatslist if x[1] == trainid]:
                self._ignoreatslist.remove(ignoreats)
            # このATSより後ろのATSの項目を_ignoreatslistに追加
            for ignoreatsid in postids:
                self._ignoreatslist.append((ignoreatsid, trainid))
        else:
            ats = value

        train = self._traindict[trainid]
        ats._startsequence(event, direction, train)


class _VRMObject(object):
    """ATS、Point、Train等の親クラス

    Args:
        client (Client): クライアントオブジェクト。
        id (int): VRMATS、VRMPoint、VRMTrain等のID。
    """

    def __init__(self, client, id):
        self._client = client
        self._id = id
        self._client._register(self)

    def send(self, command):
        """コマンド文字列をサーバーに送信する。

        Args:
            command (str): '\n'で終端されたコマンド文字列。
        """
        self._client.send(command)

    def sendquery(self, command):
        """コマンド文字列をサーバーに送信し、受信した応答文字列を返す。

        Args:
            command (str): '\n'で終端されたコマンド文字列。

        Returns:
            str: 受信した応答文字列（'\n'削除済み）。
        """
        return self._client.sendquery(command)

    def GetID(self):
        """VRMATS、VRMPoint、VRMTrain等のIDを取得する。"""
        return self._id

    @property
    def id(self):
        """VRMATS、VRMPoint、VRMTrain等のIDを取得する。"""
        return self._id


class ATS(_VRMObject):
    """VRMATSに対応するクラス

    Args:
        client (Client): クライアントオブジェクト。
        id (int): VRMATSのID。
    """

    def __init__(self, client, id):
        _VRMObject.__init__(self, client, id)
        self._forward = None
        self._reverse = None        
        self._forwardenterplatforms = []
        self._forwardleaveplatforms = []
        self._reverseenterplatforms = []
        self._reverseleaveplatforms = []        
        self._forwardentersections = []
        self._forwardleavesections = []
        self._reverseentersections = []
        self._reverseleavesections = []

    def send(self, command):
        """'LAYOUT().GetATS(id).' + コマンド文字列をサーバーに送信する。

        Args:
            command (str): '\n'で終端されたコマンド文字列。
        """
        if isinstance(self.id, tuple):
            for id in self.id:
                s = f'LAYOUT().GetATS({id}).'
                _VRMObject.send(self, s + command)
        else:
            s = f'LAYOUT().GetATS({self.id}).'
            _VRMObject.send(self, s + command)
    
    def SetUserEventFunction(self, funcname):
        """vrmapiの同名APIを実行。"""
        s = f'SetUserEventFunction("{funcname}")\n'
        self.send(s)

    def ClearUserEventFunction(self):
        """vrmapiの同名APIを実行。"""
        s = f'ClearUserEventFunction()\n'
        self.send(s)

    def _forwardfunc(self, train):
        for platform in self._forwardleaveplatforms: # ホームからの退出は 閉塞区間待ちになる前
            platform._leavesequence(train)            
        for section in self._forwardentersections: # 閉塞区間待ちになる可能性あり
            section.enter(train)
            
        for section in self._forwardleavesections: # 閉塞区間の解放は列車が停止するまで待たない
            section.leave(train)
        for platform in self._forwardenterplatforms: # 列車が停止するまで待つ可能性あり
            platform._entersequence(train)
            
        if self._forward:
            self._forward(train)

    def _reversefunc(self, train):
        for platform in self._reverseleaveplatforms: # ホームからの退出は 閉塞区間待ちになる前
            platform._leavesequence(train)            
        for section in self._reverseentersections: # 閉塞区間待ちになる可能性あり
            section.enter(train)
            
        for section in self._reverseleavesections: # 閉塞区間の解放は列車が停止するまで待たない
            section.leave(train)
        for platform in self._reverseenterplatforms: # 列車が停止するまで待つ可能性あり
            platform._entersequence(train)
            
        if self._reverse:
            self._reverse(train)

    def _startsequence(self, event, direction, train):
        """列車検出時にクライアントオブジェクトから実行される。"""
        if direction == 1:
            if self._forwardentersections or self._forwardleavesections \
            or self._forwardenterplatforms or self._forwardleaveplatforms \
            or self._forward:
                print(event, end='')
                if self._forward:
                    print(f' {self._forward.__name__}', end='')
                print()
                thread = threading.Thread(target=self._forwardfunc, args=(train,), daemon=True)
                thread.start()
        else:
            if self._reverseentersections or self._reverseleavesections \
            or self._reverseenterplatforms or self._reverseleaveplatforms \
            or self._reverse:
                print(event, end='')
                if self._reverse:
                    print(f' {self._reverse.__name__}', end='')
                print()
                thread = threading.Thread(target=self._reversefunc, args=(train,), daemon=True)
                thread.start()

    @property
    def forward(self):
        """VRMATSオブジェクトの順方向の列車検出時に実行されるユーザー定義関数を取得・設定する。"""
        return self._forward
    
    @forward.setter
    def forward(self, forward):
        self._forward = forward

    @property
    def reverse(self):
        """VRMATSオブジェクトの逆方向の列車検出時に実行されるユーザー定義関数を取得・設定する。"""
        return self._reverse
    
    @reverse.setter
    def reverse(self, reverse):
        self._reverse = reverse


class Point(_VRMObject):
    """VRMPointに対応するクラス

    Args:
        client (Client): クライアントオブジェクト。
        id (int): VRMPointのID。
    """

    def __init__(self, client, id):
        _VRMObject.__init__(self, client, id)

    def send(self, command):
        """'LAYOUT().GetPoint(id).' + コマンド文字列をサーバーに送信する。

        Args:
            command (str): '\n'で終端されたコマンド文字列。
        """
        s = f'LAYOUT().GetPoint({self.id}).'
        _VRMObject.send(self, s + command)

    def sendquery(self, command):
        """'LAYOUT().GetPoint(id).' + コマンド文字列をサーバーに送信し、受信した応答文字列を返す。

        Args:
            command (str): '\n'で終端されたコマンド文字列。

        Returns:
            str: 受信した応答文字列（'\n'削除済み）。
        """
        s = f'LAYOUT().GetPoint({self.id}).'
        return _VRMObject.sendquery(self, s + command)

    def GetBranch(self):
        """vrmapiの同名APIを実行。"""
        s = 'GetBranch()\n'
        return int(self.sendquery(s))

    def SetBranch(self, branch):
        """vrmapiの同名APIを実行。"""
        s = f'SetBranch({branch})\n'
        self.send(s)

    def SwitchBranch(self):
        """vrmapiの同名APIを実行。"""
        s = 'SwitchBranch()\n'
        self.send(s)


class Train(_VRMObject):
    """VRMTrainに対応するクラス

    Args:
        client (Client): クライアントオブジェクト。
        id (int): VRMTrainのID。
        code (int): VRMTrainの種別コード。
        number (str): VRMTrainの列車番号。
        startdistance (float): start()のデフォルト加速距離mm。
        stopdistance (float): stop()のデフォルト減速距離mm。
        voltage (float): start()のデフォルト走行速度の電圧。
    """

    def __init__(self, client, id, code=None, number=None, startdistance=200, stopdistance=50, voltage=0.5):
        _VRMObject.__init__(self, client, id)
        self._code = code
        self._number = number
        self._startdistance = startdistance
        self._stopdistance = stopdistance
        self._voltage = voltage

    def send(self, command):
        """'LAYOUT().GetTrain(id).' + コマンド文字列をサーバーに送信する。

        Args:
            command (str): '\n'で終端されたコマンド文字列。
        """
        s = f'LAYOUT().GetTrain({self.id}).'
        _VRMObject.send(self, s + command)

    def sendquery(self, command):
        """'LAYOUT().GetTrain(id).' + コマンド文字列をサーバーに送信し、受信した応答文字列を返す。

        Args:
            command (str): '\n'で終端されたコマンド文字列。

        Returns:
            str: 受信した応答文字列（'\n'削除済み）。
        """
        s = f'LAYOUT().GetTrain({self.id}).'
        return _VRMObject.sendquery(self, s + command)

    def AutoSpeedCTRL(self, distance, voltage):
        """vrmapiの同名APIを実行。"""
        s = f'AutoSpeedCTRL({distance}, {voltage})\n'
        self.send(s)

    def GetDirection(self):
        """vrmapiの同名APIを実行。"""
        s = 'GetDirection()\n'
        return int(self.sendquery(s))

    def GetVoltage(self):
        """vrmapiの同名APIを実行。"""
        s = 'GetVoltage()\n'
        return float(self.sendquery(s))

    def SetTimerVoltage(self, sec, voltage):
        """vrmapiの同名APIを実行。"""
        s = f'SetTimerVoltage({sec}, {voltage})\n'
        self.send(s)

    def SetTrainCode(self, code=None):
        """vrmapiの同名APIを実行。

        codeを省略するとcodeプロパティが使用される。
        codeプロパティも設定されていないときは何もしない。
        """
        if code is None:
            code = self._code
        if code:
            s = f'SetTrainCode({code})\n'
            self.send(s)

    def SetTrainNumber(self, number=None):
        """vrmapiの同名APIを実行。

        numberを省略するとnumberプロパティが使用される。
        numberプロパティも設定されていないときは何もしない。
        """
        if number is None:
            number = self._number
        if number:
            s = f'SetTrainNumber("{number}")\n'
            self.send(s)

    def SetVoltage(self, voltage):
        """vrmapiの同名APIを実行。"""
        s = f'SetVoltage({voltage})\n'
        self.send(s)

    def Turn(self):
        """vrmapiの同名APIを実行。"""
        s = 'Turn()\n'
        self.send(s)

    def start(self, distance=None, voltage=None):
        """AutoSpeedCTRL(distance, voltage)を実行。

        distanceを省略するとstartdistanceプロパティが使用される。
        voltageを省略するとvoltageプロパティが使用される。

        Args:
            distance (float): 加速距離mm。
            voltage (float): 走行速度の電圧。
        """
        if not distance:
            distance = self._startdistance
        if not voltage:
            voltage = self._voltage
        self.AutoSpeedCTRL(distance, voltage)

    def stop(self, distance=None, wait=True):
        """AutoSpeedCTRL(distance, 0.0)を実行し、列車が停止するまで待つ。

        distanceを省略するとstopdistanceプロパティが使用される。

        Args:
            distance (float): 減速距離mm。
            wait (bool): Trueなら列車が停止するまで待つ。
        """
        if not distance:
            distance = self._stopdistance
        self.AutoSpeedCTRL(distance, 0.0)
        if wait:
            self.waituntilstop()

    def waituntilstop(self):
        """列車が停止するまで待つ。"""
        while True:
            time.sleep(1)
            if self.GetVoltage() < 0.01:
                break

    @property
    def number(self):
        """VRMTrainの列車番号の文字列を取得・設定する。"""
        return self._number
    
    @number.setter
    def number(self, number):
        self._number = number
        self.SetTrainNumber()

    @property
    def startdistance(self):
        """start()のデフォルト加速距離mmを取得・設定する。"""
        return self._distance
    
    @startdistance.setter
    def startdistance(self, startdistance):
        self._startdistance = startdistance

    @property
    def stopdistance(self):
        """stop()のデフォルト減速距離mmを取得・設定する。"""
        return self._distance
    
    @stopdistance.setter
    def stopdistance(self, stopdistance):
        self._stopdistance = stopdistance

    @property
    def voltage(self):
        """start()のデフォルト走行速度の電圧を取得・設定する。

        走行中なら列車の電圧も即時変更する。
        """
        return self._voltage
    
    @voltage.setter
    def voltage(self, voltage):
        self._voltage = voltage
        if self.GetVoltage() >= 0.01:
            self.start()
    

class Platform(object):
    """駅のプラットフォームのクラス

    駅に管理されない場合、進入してきたすべての列車をゆっくり停車させる。
    駅に管理されている場合、駅のnumbersプロパティに列車番号が含まれる列車だけをゆっくり停車させる。
    start()メソッドでプラットフォームに停車している列車をゆっくり発車させる。

    Args:
        atses (tuple(ATS)): プラットフォームの両端のATSのタプル。
            プラットフォームに入る向きのATS、出る向きのATSの順(□>、□>)。
            終点で片側にしかATSがない場合は(□>、None)または(None、□>)のようにする。
            ATSの向きと反対に走行する列車にも対応しているので、単線の往復走行にも使用できる。
        restart (float): 停車した列車を指定秒数後ゆっくり発車。省略すると停車のまま。
        startdistance (float): 発車時の加速距離mm。
        stopdistance (float): 停車時の減速距離mm。
        train (Train): 初期状態でプラットフォームに入っている列車。
        name (str): デバッグ用にprint()で表示する名前。
    """

    def __init__(self, atses, restart=None, startdistance=400, stopdistance=550, train=None, name=None):
        self._restart = restart
        self._atses = atses
        if isinstance(self._atses[0], ATS):
            self._atses[0]._forwardenterplatforms.append(self)
            self._atses[0]._reverseleaveplatforms.append(self)
        if isinstance(self._atses[1], ATS):
            self._atses[1]._forwardleaveplatforms.append(self)
            self._atses[1]._reverseenterplatforms.append(self)
            
        self._startdistance = startdistance
        self._stopdistance = stopdistance
        
        self._train = None        
        self._lock = threading.Lock()
        if isinstance(train, Train):
            self._lock.acquire()
            try:
                self._train = train
            finally:
                self._lock.release()
                
        self._name = name
        self._station = None

    def enter(self, train):
        """プラットフォームに列車が停車したことにする。

        プラットフォームに登録したATSにより自動的に呼ばれる。
        引数でわたされた列車をこのプラットフォームに停車中の列車とする。
        
        Args:
            train (Train): プラットフォームに停車したことにする列車。
        """
        self._lock.acquire()
        try:
            self._train = train
            if self._name:
                print(f'{self._name}.enter()')
        finally:
            self._lock.release()

    def leave(self, train=None):
        """プラットフォームから列車が発車したことにする。

        プラットフォームに登録したATSにより自動的に呼ばれる。
        このプラットフォームに停車中の列車は無しになる。
        列車を指定した場合、指定した列車が停車中なら発車したことにする。
        列車を指定しない場合、どの列車が停車中でも発車したことにする。
        
        Args:
            train (Train): プラットフォームから発車したことにする列車。

        Returns:
            Train: プラットフォームから発車したことにした列車。なければNoneを返す。
        """
        self._lock.acquire()
        try:
            t = None
            if train is None or train == self._train:
                t = self._train
                self._train = None
                if self._name:
                    print(f'{self._name}.leave()')
            return t
        finally:
            self._lock.release()

    def start(self, train=None, distance=None, voltage=None):
        """プラットフォームから列車を発車させる。

        列車を指定した場合、指定した列車が停車中なら発車させる。
        列車を指定しない場合、どの列車が停車中でも発車させる。

        Args:
            train (Train): プラットフォームから発車させる列車。
            distance (float): 発車時の加速距離。省略時はstartdistanceプロパティの値。
            voltage (float): 走行速度の電圧。省略時は列車のvoltageプロパティの値。

        Returns:
            Train: 発車させた列車。なければNoneを返す。
        """
        if distance is None:
            distance = self._startdistance
        t = self.leave(train)
        if t:
            t.start(distance, voltage)
        return t

    def _entersequence(self, train):
        if self._station is None or train.number in self._station.numbers:
            train.stop(self._stopdistance)
            self.enter(train)
            if None in self._atses: # 行き止まり
                train.Turn()
            if self._restart is not None:
                time.sleep(self._restart)
                self.start(train)

    def _leavesequence(self, train):
        self.leave(train)


class Section(object):
    """閉塞区間のクラス


    Args:
        atses (tuple(ATS)): 閉塞区間の両端のATSのタプル。
            閉塞区間に入る向きのATS、出る向きのATSの順(□>、□>)。
            分岐、合流で複数のATSが端にある場合は((□>, □>, □>), □>)のようにする。
            終点で片側にしかATSがない場合は(□>、None)または(None、□>)のようにする。
            ATSの向きと反対に走行する列車にも対応しているので、単線の往復走行にも使用できる。
        train (Train): 初期状態で閉塞区間に入っている列車。
        name (str): デバッグ用にprint()で表示する名前。
    """

    def __init__(self, atses, train=None, name=None):
        self._atses = atses
        if isinstance(self._atses[0], tuple):
            for ats in self._atses[0]:
                if isinstance(ats, ATS):
                    ats._forwardentersections.append(self)
                    ats._reverseleavesections.append(self)
        elif isinstance(self._atses[0], ATS):
            self._atses[0]._forwardentersections.append(self)
            self._atses[0]._reverseleavesections.append(self)
        if isinstance(self._atses[1], tuple):
            for ats in self._atses[1]:
                if isinstance(ats, ATS):
                    ats._forwardleavesections.append(self)
                    ats._reverseentersections.append(self)
        elif isinstance(self._atses[1], ATS):
            self._atses[1]._forwardleavesections.append(self)
            self._atses[1]._reverseentersections.append(self)

        self._train = None
        self._lock = threading.Lock()
        if isinstance(train, Train):
            self._lock.acquire()
            self._train = train

        self._name = name

    def enter(self, train):
        """閉塞区間に列車を進入させる。

        閉塞区間が空ならそのまま走行。処理は呼び出し側に戻る。
        空でないなら空になるまで停車して待つ。処理も空になるまで戻らない。
        
        Args:
            train (Train): 閉塞区間に進入する列車。
        """
        train.stop(wait=False)
        self._lock.acquire()
        self._train = train
        if self._name:
            print(f'{self._name}.enter()')
        train.start()

    def leave(self, train=None):
        """閉塞区間から列車を退出させる。

        列車を指定した場合、指定した列車が在るときだけを閉塞区間から退出させる。
        列車を指定しない場合、どの列車が在っても閉塞区間から退出させる。
        
        Args:
            train (Train): 閉塞区間から退出する列車。

        Returns:
            Train: 閉塞区間から退出させ列車。なければNoneを返す。
        """
        t = None
        if train is None or train == self._train:
            t = self._train
            self._train = None
            if self._name:
                print(f'{self._name}.leave()')
            try:
                self._lock.release()
            except RuntimeError:
                pass # 閉塞区間に列車が無いときleave()を呼んでも例外にしない
        return t


class Station(object):
    """プラットホームを管理する駅のクラス

    numbersプロパティに列車番号が含まれる列車だけをプラットホームに停車させる。
    start(列車番号)メソッドで列車番号に該当する列車を発車させる。

    Args:
        name (str): 駅名。
        platforms (tuple(Platform)): 駅に属するプラットホームのタプル。
        numbertotrain (function): 列車番号に該当する列車を返す関数。
            型: 関数名(列車番号) -> 列車
    """

    def __init__(self, name, platforms, numbertotrain):
        self._name = name
        self._platforms = platforms
        for platform in self._platforms:
            platform._station = self
        self._numbertotrain = numbertotrain
        self._numbers = []

    def start(self, number):
        """駅から列車を発車させる。

        Args:
            number (str): 発車させる列車の列車番号。

        Returns:
            Train: 発車させた列車。なければNoneを返す。
        """
        train = self._numbertotrain(number)
        if train:
            for platform in self._platforms:
                t = platform.start(train)
                if t:
                    t.number = number
                    return t
        return None

    @property
    def name(self):
        """駅名を取得・設定する。"""
        return self._name
    
    @name.setter
    def name(self, name):
        self._name = name

    @property
    def platforms(self):
        """駅に属するプラットホームのタプルを取得する。"""
        return self._platforms

    @property
    def numbers(self):
        """駅に停車させる列車番号のリストを取得する。"""
        return self._numbers


def cleartimetable(secondsago=5):
    """sucheduleモジュールをクリアして自動運転の開始時刻を返す。

        Args:
            secondsago (float): 自動運転の開始時刻の何秒前に登録するか。

        Returns:
            datetime.datetime: 自動運転の開始時刻。
    """
    schedule.clear()

    # 00秒から開始
    now = datetime.datetime.now()
    basetime = (now + datetime.timedelta(minutes=1)).replace(second=0)
    if now.second >= 60 - secondsago: # 登録にsecondsago秒確保
        basetime = (now + datetime.timedelta(minutes=2)).replace(second=0)
    print(f'現在時刻: {now.strftime("%H:%M:%S")}')
    print(f'開始時刻: {basetime.strftime("%H:%M:%S")}')
    print()

    # 翌日の発車時刻で動作しないように、登録を開始時刻のsecondsago秒前まで待つ
    waittime = basetime - datetime.timedelta(seconds=secondsago)
    while datetime.datetime.now() < waittime:
        time.sleep(1)

    return basetime


def readtimetable(basetime, minutes, timetable, stations, starttrain):
    """時刻表の文字列を解釈して各駅の発車時刻をsucheduleモジュールに登録する。

    下記フォーマットの文字列を解釈して、各駅の発車時刻をscheduleモジュールに登録する。
    また、駅に停車させる列車番号を各駅のnumbersプロパティに追加する。
    
        列車番号,駅１	,駅２	,駅１	,駅２	
        A0000	,00:00	,00:40	,01:00
        B0000	,	,00:00	,01:20	,01:50
        A0200	,02:00	,---->	,03:10
        B0200	,      	,02:00	,03:20	,03:50

    発車時刻をminutes周期で繰り返し終日分登録する。
        例:
            00:00 => 09:20:00, 09:24:00, ..., 23:56:00, 00:00:00, ..., 09:12:00, 09:16:00
            00:40 => 09:20:40, 09:24:40, ..., 23:56:40, 00:00:40, ..., 09:12:40, 09:16:40
    
    Args:
        basetime (datetime.datetime): 自動運転の開始時刻。
        minutes (int): 時刻表の文字列に記述されている分数。
        timetable (str): 時刻表の文字列。
        stations (Station): 駅のタプル。
        starttrain (function): 駅から列車番号の列車を発車させる関数。
            型: 関数名(駅, 列車番号)
    """

    def tohhmmss(dt, mmss):
        zero = datetime.datetime.strptime('00:00', '%M:%S')
        delta = datetime.datetime.strptime(mmss, '%M:%S') - zero
        hhmmss = (dt + delta).strftime('%H:%M:%S')
        #print(f'{mmss} -> {hhmmss}')
        return hhmmss

    lines = timetable.split('\n')
    if not lines:
        print('timetableが空です。')
        return

    print(f'登録開始: {datetime.datetime.now().strftime("%H:%M:%S")}')

    # 空行を読み飛ばす
    r = 0
    while not lines[r]:
        r += 1

    titlelst = lines[r].split(',')

    # 駅名でないカラムタイトルを警告
    for c in titlelst[1:]:
        stationname = c.strip()
        match = [x for x in stations if x.name == stationname]
        if not match:
            print(f'{stationname}は駅名ではありません。')

    for c in titlelst:
        print(c, end='')
    print()
    for line in lines[r + 1:]:
        if line:
            lst = line.split(',')
            for c in lst:
                print(c, end='')
            print()

    patmmss = re.compile(r'^[0-5]\d:[0-5]\d$')

    for line in lines[r + 1:]:
        lst = line.split(',')
        trainnumber = lst[0].strip()
        if not trainnumber:
            continue

        # この列車番号の発車時刻リストを作る
        starttimelist = []
        for i in range(1, len(lst)):
            stationname = titlelst[i].strip()
            match = [x for x in stations if x.name == stationname]
            if not match:
                continue
            station = match[0]

            starttime = lst[i].strip()
            if patmmss.search(starttime):
                starttimelist.append((station, starttime))
                station.numbers.append(trainnumber) # 時刻のある駅に停車させる列車番号を追加
            else:
                starttimelist.append((None, None))

        # 最後の時刻は終点の停車時刻なので発車時刻リストから削除
        starttimelist.reverse()
        match = [i for i, x in enumerate(starttimelist) if x != (None, None)]
        if match:
            starttimelist[match[0]] = (None, None)
        starttimelist.reverse()

        # スケジュールを登録
        for station, starttime in starttimelist:
            if station is None or starttime is None:
                continue
            if patmmss.search(starttime):
                # minutes分間隔で終日分繰り返し登録
                for m in range(0, 24 * 60 - (minutes - 1), minutes):
                    t = basetime + datetime.timedelta(minutes=m)
                    schedule.every().day.at(tohhmmss(t, starttime)).do(starttrain, station, trainnumber)

    print(f'登録完了: {datetime.datetime.now().strftime("%H:%M:%S")}')
    print()
