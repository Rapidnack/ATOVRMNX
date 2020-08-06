/*
VRM-NX用サーバーモジュールatovrmnxserverに接続するクライアントモジュール

関数:
	sleep(): 指定した秒数後次の処理に進む。
	createUUID(): ユニークな識別子を返す。
	isNumber(): 数値のときはtrue、それ以外のときはfalseを返す。

クラス:
	Client: VRM-NXに追加したサーバーに接続するクライアントのクラス
	ATS: VRMATSに対応するクラス
	Point: VRMPointに対応するクラ
	Train: VRMTrainに対応するクラス
	 Platform: 駅のプラットホームのクラス
	Section: 閉塞区間のクラス
*/


/*
指定した秒数後次の処理に進む。
*/
async function sleep(sec) {
	return new Promise(function(resolve) {
		setTimeout(resolve, Math.round(sec * 1000));
	});
}


/*
ユニークな識別子を返す。
*/
function createUUID() {
   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
   });
}


/*
数値のときはtrue、それ以外のときはfalseを返す。
*/
function isNumber(value) {
  return ((typeof value === 'number') && (isFinite(value)));
}


/*
VRM-NX用サーバーモジュールatovrmnxserverに接続するクライアントのクラス
*/
class Client {

	constructor() {
		this._uuid = createUUID();
		this._atsDict = {}
		this._pointDict = {}
		this._trainDict = {}
		this._sequenceDict = {}
		this._ignoreATSList = []
		this._commandSocket = null;
		this._eventSocket = null;
		this._stopFlag = false;
		this._ATSEventHandlerName = 'vrmevent_serverats';
	}

	/*
	コマンド用とイベント用の２つのTCPソケットをサーバーに接続する。

	接続後イベントを受信し続ける。

	Args:
		address (str): サーバーアドレス。
		commandport (int): コマンド用TCPソケットのポート番号。
		eventport (int): イベント用TCPソケットのポート番号。
	*/
	async connect(address='127.0.0.1', commandPort=54011, eventPort=54012) {
		this._address = address;
		this._commandPort = commandPort;
		this._eventPort = eventPort;

		// コマンド用とイベント用の２つのTCPソケットをサーバーに接続
		await this._openCommandSocket();
		await this._openEventSocket();

		// 登録済みのATSオブジェクトに対応するサーバー側のVRMATSオブジェクトを
		// イベント送信可能にする
		for (let key in this._atsDict) {
			let ats = this._atsDict[key];
			await ats.SetUserEventFunction(this._ATSEventHandlerName);
		}

		// 登録済みのTrainオブジェクトに対応するサーバー側のVRMTrainオブジェクトに
		// 種別コードと列車番号を付ける
		for (let key in this._trainDict) {
			let train = this._trainDict[key];
			if (train.code != null) {
				await train.SetTrainCode(train.code);
			}
			if (train.number != null) {
				await train.SetTrainNumber(train.number);
			}
		}

		// イベント受信を開始
		let self = this;
		this._eventSocket.onmessage = function(event) {
			let reader = new FileReader();
			reader.onloadend = async function(e) {
				let lines = reader.result.split('\n');
				for (let line of lines) {
					if (self._stopFlag)
						break;

					let lst = line.split(' ');
					let atsId = parseInt(lst[1]);
					let trainId = parseInt(lst[2]);
					let direction = parseInt(lst[3]);
					if (!(trainId in self._trainDict))
						return;
					let key = [atsId, direction];
					if (!(key in self._sequenceDict))
						return;

					let value = self._sequenceDict[key];
					let ats = null;
					if (value instanceof Array) {
						ats = value[0];
						let preIds = value[1];
						let postIds = value[2];

						// _ignoreATSListにあればイベントを発生しない
						let index = self._ignoreATSList.indexOf([atsId, trainId].toString());
						if (index >= 0) {
							// このATSの項目を_ignoreATSListから削除
							self._ignoreATSList.splice(index, 1);
							// このATSより前の項目は古いので_ignoreATSListから削除
							for (let ignoreATSId of preIds) {
								let idx = self._ignoreATSList.indexOf([ignoreATSId, trainId].toString());
								if (idx >= 0) {
									self._ignoreATSList.splice(idx, 1);
								}
							}
							//console.log(self._ignoreATSList);
							return;
						}
						// このATSより前の見逃したATSがあれば表示
						if (preIds.length > 0) {
							console.log(`${preIds} missed`);
						}
						// 同じtrainIdの項目は古いので_ignoreATSListから削除
						let lst = self._ignoreATSList.slice();
						for (let i = lst.length - 1; i >= 0; i--) {
							if (lst[i].split(',')[1] == trainId) {
								//console.log(`remove '${lst[i]}'`);
								self._ignoreATSList.splice(i, 1);
							}
						}
						// このATSより後ろのATSの項目を_ignoreATSListに追加
						for (let ignoreATSId of postIds) {
							self._ignoreATSList.push([ignoreATSId, trainId].toString());
						}
						//console.log(self._ignoreATSList);
					} else {
						ats = value;
					}

					let train = self._trainDict[trainId];
					try {
						await ats._startSequence(line.trimEnd(), direction, train);
					} catch (e) {
						console.log(e.message);
					}
				}
			};
			reader.readAsText(event.data);
		};
	}

	/*
	サーバーとの接続を切る。
	*/
	disconnect() {
		this._closeEventSocket();
		this._closeCommandSocket();
	}

	/*
	クライアントを停止する。
	*/
	async stop() {
		this._stopFlag = true;

		// 登録済みのATSオブジェクトに対応するサーバー側のVRMATSオブジェクトを
		// イベント送信不可にする
		for (let key in this._atsDict) {
			let ats = this._atsDict[key];
			await ats.ClearUserEventFunction();
		}
	}

	/*
	コマンド文字列をサーバーに送信する。

	Args:
		command (str): '\n'で終端されたコマンド文字列。
	*/
	async send(command) {
		if (this._stopFlag)
			return;
		if (this._commandSocket == null) {
			throw new Error('接続されていません。');
		} else if (this._commandSocket.readyState != 1) {
			throw new Error('接続が切れました。');
		}

		await navigator.locks.request(this._uuid, async lock => {
			try {
				this._commandSocket.send(new Blob([command], {type: 'text/plain'}));
			} catch (e) {
				throw new Error('送信に失敗しました。');
			}
		});
	}

	/*
	コマンド文字列をサーバーに送信し、受信した応答文字列を返す。

	Args:
		command (str): '\n'で終端されたコマンド文字列。

	Returns:
		str: 受信した応答文字列（'\n'削除済み）。
	*/
	async sendQuery(command) {
		if (this._stopFlag)
			return '0';
		if (this._commandSocket == null) {
			throw new Error('接続されていません。');
		} else if (this._commandSocket.readyState != 1) {
			throw new Error('接続が切れました。');
		}

		let r = null;
		await navigator.locks.request(this._uuid, async lock => {
			r = await this._sendQuery(command);
			if (r == null) {
				throw new Error('受信タイムアウト。');
			}
		});
		return r;
	}

	async _sendQuery(command) {
		let self = this;
		return new Promise(function(resolve) {
			self._commandSocket.onmessage = function(event) {
				let reader = new FileReader();
				reader.onloadend = function(e) {
					resolve(reader.result.trimEnd());
				};
				reader.readAsText(event.data);
			};
			try {
				self._commandSocket.send(new Blob([command], {type: 'text/plain'}));
			} catch (e) {
				throw new Error('送信に失敗しました。');
			}
			setTimeout(function() {
				resolve(null);
			}, 3000);
		});
	}

	_register(vrmObject) {
		if (vrmObject instanceof ATS) {
			this._atsDict[vrmObject.id] = vrmObject

			let id = vrmObject.id;
			if (id instanceof Array) { // 一か所に複数のATSを使う場合
				if (id.length == 0) {
					return;
				} else if (id.length == 1) { // 一か所に１つのATSだけの場合
					// 辞書の値はATSのみ
					this._sequenceDict[[id[0], 1]] = vrmObject;
					this._sequenceDict[[id[0], -1]] = vrmObject;
					return;
				}

				// idが(40, 41, 42)の場合列車は40→41→42の順に検出されるので次のように登録する
				// 辞書の値は(ATS, 自分より前のATSのリスト, 自分より後ろのATSのリスト)のタプル
				// this._sequenceDict[(40, 1)] = (vrmObject, [], [41, 42])
				// this._sequenceDict[(41, 1)] = (vrmObject, [40], [42])
				// this._sequenceDict[(42, 1)] = (vrmObject, [40, 41], [])
				for (let i = 0; i < id.length; i++) {
					this._sequenceDict[[id[i], 1]] =
						[vrmObject, id.slice(0, i), id.slice(i + 1)];
				}

				// idが(40, 41, 42)の場合列車は42→41→40の順に検出されるので次のように登録する
				// this._sequenceDict[(42, -1)] = (vrmObject, [], [41, 40])
				// this._sequenceDict[(41, -1)] = (vrmObject, [42], [40])
				// this._sequenceDict[(40, -1)] = (vrmObject, [42, 41], [])
				id.reverse();
				for (let i = 0; i < id.length; i++) {
					this._sequenceDict[[id[i], -1]] =
						[vrmObject, id.slice(0, i), id.slice(i + 1)];
				}				

			} else { // 一か所に１つのATSだけの場合
				// 辞書の値はATSのみ
				this._sequenceDict[[id, 1]] = vrmObject;
				this._sequenceDict[[id, -1]] = vrmObject;
			}

		} else if (vrmObject instanceof Point) {
			this._pointDict[vrmObject.id] = vrmObject

		} else if (vrmObject instanceof Train) {
			this._trainDict[vrmObject.id] = vrmObject
		}
	}

	_closeCommandSocket() {
		if (this._commandSocket != null) {
			this._commandSocket.close();
		}
	}

	_closeEventSocket() {
		if (this._eventSocket != null) {
			this._eventSocket.close();
		}
	}

	async _openCommandSocket() {
		let self = this;
		return new Promise(function(resolve) {
			console.log(`connecting to ${self._address}:${self._commandPort}`);
			let s = `ws://${self._address}:${self._commandPort}/`;
			self._commandSocket = new WebSocket(s);
			self._commandSocket.onopen = function(e) {
				console.log('command socket connected');
				resolve();
			};
			self._commandSocket.onclose = function(e) {
				//console.log('command socket closed');
			};
		});
	}

	async _openEventSocket() {
		let self = this;
		return new Promise(function(resolve) {
			console.log(`connecting to ${self._address}:${self._eventPort}`);
			let s = `ws://${self._address}:${self._eventPort}/`;
			self._eventSocket = new WebSocket(s);
			self._eventSocket.onopen = function(e) {
				console.log('event socket connected');
				resolve();
			};
			self._eventSocket.onclose = async function(e) {
				//console.log('event socket closed');
			};
		});
	}
}


/*
ATS、Point、Train等の親クラス

Args:
	client (Client): クライアントオブジェクト。
*/
class _VRMObject {
	constructor(client) {
		this._client = client;
		this._id = null;
	}

	/*
	コマンド文字列をサーバーに送信する。

	Args:
		command (str): '\n'で終端されたコマンド文字列。
	*/
	async send(command) {
		await this._client.send(command);
	}

	/*
	コマンド文字列をサーバーに送信し、受信した応答文字列を返す。

	Args:
		command (str): '\n'で終端されたコマンド文字列。

	Returns:
		str: 受信した応答文字列（'\n'削除済み）。
	*/
	async sendQuery(command) {
		return await this._client.sendQuery(command);
	}

	/*
	ATS、Point、Train等のオブジェクトをクライアントオブジェクトに登録する。

	Args:
		vrmObject (_VRMObject): ATS、Point、Trainのオブジェクト。
	*/
	register(vrmObject) {
		this._client._register(vrmObject);
	}

	/*
	IDを取得する。
	*/
	GetID() {
		return this._id;
	}

	/*
	IDを取得する。
	*/
	get id() {
		return this._id;
	}

	/*
	IDを設定する。
	*/
	set id(id) {
		this._id = id;
	}
}


/*
VRMATSに対応するクラス

Args:
	client (Client): クライアントオブジェクト。
*/
class ATS extends _VRMObject {
	constructor(client) {
		super(client);
		this._forward = null;
		this._reverse = null;
		this._forwardEnterPlatforms = [];
		this._forwardLeavePlatforms = [];
		this._reverseEnterPlatforms = [];
		this._reverseLeavePlatforms = [];
		this._forwardEnterSections = [];
		this._forwardLeaveSections = [];
		this._reverseEnterSections = [];
		this._reverseLeaveSections = [];
	}

	/*
	'LAYOUT().GetATS(id).' + コマンド文字列をサーバーに送信する。

	Args:
		command (str): '\n'で終端されたコマンド文字列。
	*/
	async send(command) {
		if (this.id == null) {
			throw new Error('ATSのIDがセットされていません。');
		}

		if (this.id instanceof Array) {
			for (let id of this.id) {
				let s = `LAYOUT().GetATS(${id}).`;
				await super.send(s + command);
			}
		} else {
			let s = `LAYOUT().GetATS(${this.id}).`;
			await super.send(s + command);
		}
	}

	/*
	vrmapiの同名APIを実行。
	*/
	async SetUserEventFunction(funcName) {
        	let s = `SetUserEventFunction("${funcName}")\n`;
		await this.send(s);
	}

	/*
	vrmapiの同名APIを実行。
	*/
	async ClearUserEventFunction() {
        	let s = 'ClearUserEventFunction()\n';
		await this.send(s);
	}

	async _forwardFunc(train) {
		// ホームからの退出は 閉塞区間待ちになる前
		for (let platform of this._forwardLeavePlatforms) {
			await platform._leaveSequence(train);
		}
		// 閉塞区間待ちになる可能性あり
		for (let section of this._forwardEnterSections) {
			await section.enter(train);
		}

		// 閉塞区間の解放は列車が停止するまで待たない
		for (let section of this._forwardLeaveSections) {
			await section.leave(train);
		}
		// 列車が停止するまで待つ可能性あり
		for (let platform of this._forwardEnterPlatforms) {
			await platform._enterSequence(train);
		}

		if (this._forward != null) {
			await this._forward(train);
		}
	}

	async _reverseFunc(train) {
		// ホームからの退出は 閉塞区間待ちになる前
		for (let platform of this._reverseLeavePlatforms) {
			await platform._leaveSequence(train);
		}
		// 閉塞区間待ちになる可能性あり
		for (let section of this._reverseEnterSections) {
			await section.enter(train);
		}

		// 閉塞区間の解放は列車が停止するまで待たない
		for (let section of this._reverseLeaveSections) {
			await section.leave(train);
		}
		// 列車が停止するまで待つ可能性あり
		for (let platform of this._reverseEnterPlatforms) {
			await platform._enterSequence(train);
		}

		if (this._reverse) {
			await this._reverse(train);
		}
	}

	async _startSequence(event, direction, train) {
		if (direction == 1) {
			if (this._forwardEnterSections || this._forwardLeaveSections
			|| this._forwardEnterPlatforms || this._forwardLeavePlatforms
			|| this._forward) {
				let s = `${event}`;
				if (this._forward) {
					s += ` ${this._forward.name}`;
				}
				console.log(s);
				await this._forwardFunc(train);
			}
		} else {
			if (this._reverseEnterSections || this._reverseLeaveSections
			|| this._reverseEnterPlatforms || this._reverseLeavePlatforms
			|| this._reverse) {
				let s = `${event}`;
				if (this._reverse) {
					s += ` ${this._reverse.name}`;
				}
				console.log(s);
				await this._reverseFunc(train);
			}
		}
	}

	/*
	IDを取得する。
	*/
	get id() {
		return super.id;
	}

	/*
	IDを設定する。
	*/
	set id(id) {
		if (id instanceof Array) { // 一か所に複数のATSを使う場合
			for (let i = 0; i < id.length; i++) {
				if (!isNumber(id[i])) {
					throw new Error('ATSのIDに数値をセットしてください。');
				}
			}
		} else if (!isNumber(id)) {
			throw new Error('ATSのIDに数値をセットしてください。');
		}

		super.id = id;
		this.register(this);
	}

	/*
	VRMATSオブジェクトの順方向の列車検出時に実行されるユーザー定義関数を取得する。
	*/
	get forward() {
		return this._forward;
	}

	/*
	VRMATSオブジェクトの順方向の列車検出時に実行されるユーザー定義関数を設定する。
	*/
	set forward(forward) {
		this._forward = forward;
	}

	/*
	VRMATSオブジェクトの逆方向の列車検出時に実行されるユーザー定義関数を取得する。
	*/
	get reverse() {
		return this._reverse;
	}

	/*
	VRMATSオブジェクトの逆方向の列車検出時に実行されるユーザー定義関数を設定する。
	*/
	set reverse(reverse) {
		this._reverse = reverse;
	}
}


/*
VRMPointに対応するクラス

Args:
	client (Client): クライアントオブジェクト。
*/
class Point extends _VRMObject {
	constructor(client) {
		super(client);
	}

	/*
	'LAYOUT().GetPoint(id).' + コマンド文字列をサーバーに送信する。

	Args:
		command (str): '\n'で終端されたコマンド文字列。
	*/
	async send(command) {
		if (this.id == null) {
			throw new Error('ポイントのIDがセットされていません。');
		}

		let s = `LAYOUT().GetPoint(${this.id}).`;
		await super.send(s + command);
	}

	/*
	'LAYOUT().GetPoint(id).' + コマンド文字列をサーバーに送信し、受信した応答文字列を返す。

	Args:
		command (str): '\n'で終端されたコマンド文字列。

	Returns:
		str: 受信した応答文字列（'\n'削除済み）。
	*/
	async sendQuery(command) {
		if (this.id == null) {
			throw new Error('ポイントのIDがセットされていません。');
		}

		let s = `LAYOUT().GetPoint(${this.id}).`;
		return await super.sendQuery(s + command);
	}

	/*
	vrmapiの同名APIを実行。
	*/
	async GetBranch() {
		let s = 'GetBranch()\n';
		return parseInt(await this.sendQuery(s));
	}

	/*
	vrmapiの同名APIを実行。
	*/
	async SetBranch(branch) {
        	let s = `SetBranch(${branch})\n`;
		await this.send(s);
	}

	/*
	vrmapiの同名APIを実行。
	*/
	async SwitchBranch() {
        	let s = 'SwitchBranch()\n';
		await this.send(s);
	}

	/*
	IDを取得する。
	*/
	get id() {
		return super.id;
	}

	/*
	IDを設定する。
	*/
	set id(id) {
		if (!isNumber(id)) {
			throw new Error('ポイントのIDに数値をセットしてください。');
		}

		super.id = id;
		this.register(this);
	}
}


/*
VRMTrainに対応するクラス

Args:
	client (Client): クライアントオブジェクト。
*/
class Train extends _VRMObject {
	constructor(client) {
		super(client);
		this._code = null;
		this._number = null;
		this._startDistance = 200;
		this._stopDistance = 50;
		this._voltage = 0.5;
	}

	/*
	'LAYOUT().GetTrain(id).' + コマンド文字列をサーバーに送信する。

	Args:
		command (str): '\n'で終端されたコマンド文字列。
	*/
	async send(command) {
		if (this.id == null) {
			throw new Error('列車のIDがセットされていません。');
		}

		let s = `LAYOUT().GetTrain(${this.id}).`;
		await super.send(s + command);
	}

	/*
	'LAYOUT().GetTrain(id).' + コマンド文字列をサーバーに送信し、受信した応答文字列を返す。

	Args:
		command (str): '\n'で終端されたコマンド文字列。

	Returns:
		str: 受信した応答文字列（'\n'削除済み）。
	*/
	async sendQuery(command) {
		if (this.id == null) {
			throw new Error('列車のIDがセットされていません。');
		}

		let s = `LAYOUT().GetTrain(${this.id}).`;
		return await super.sendQuery(s + command);
	}

	/*
	vrmapiの同名APIを実行。
	*/
	async AutoSpeedCTRL(distance, voltage) {
        	let s = `AutoSpeedCTRL(${distance}, ${voltage})\n`;
		await this.send(s);
	}

	/*
	vrmapiの同名APIを実行。
	*/
	async GetDirection() {
		let s = 'GetDirection()\n';
		return parseInt(await this.sendQuery(s));
	}

	/*
	vrmapiの同名APIを実行。
	*/
	async GetVoltage() {
		let s = 'GetVoltage()\n';
		return parseFloat(await this.sendQuery(s));
	}

	/*
	vrmapiの同名APIを実行。
	*/
	async SetTimerVoltage(sec, voltage) {
        	let s = `SetTimerVoltage(${sec}, ${voltage})\n`;
		await this.send(s);
	}

	/*
	vrmapiの同名APIを実行。
	*/
	async SetTrainCode(code) {
        	let s = `SetTrainCode(${code})\n`;
		await this.send(s);
	}

	/*
	vrmapiの同名APIを実行。
	*/
	async SetTrainNumber(number) {
        	let s = `SetTrainNumber("${number}")\n`;
		await this.send(s);
	}

	/*
	vrmapiの同名APIを実行。
	*/
	async SetVoltage(voltage) {
        	let s = `SetVoltage(${voltage})\n`;
		await this.send(s);
	}

	/*
	vrmapiの同名APIを実行。
	*/
	async Turn() {
        	let s = 'Turn()\n';
		await this.send(s);
	}

	/*
	AutoSpeedCTRL(distance, voltage)を実行。

	distanceを省略するとstartdistanceプロパティが使用される。
	voltageを省略するとvoltageプロパティが使用される。

	Args:
		distance (float): 加速距離mm。
		voltage (float): 走行速度の電圧。
	*/
	async start(distance=null, voltage=null) {
		if (distance == null) {
			distance = this._startDistance;
		}
		if (voltage == null) {
			voltage = this._voltage;
		}
		await this.AutoSpeedCTRL(distance, voltage);
	}

	/*
	AutoSpeedCTRL(distance, 0.0)を実行し、列車が停止するまで待つ。

	distanceを省略するとstopdistanceプロパティが使用される。

	Args:
		distance (float): 減速距離mm。
		wait (bool): Trueなら列車が停止するまで待つ。
	*/
	async stop(distance=null, wait=true) {
		if (distance == null) {
			distance = this._stopDistance;
		}
		await this.AutoSpeedCTRL(distance, 0.0);
		if (wait) {
			await this.waitUntilStop();
		}
	}

	/*
	列車が停止するまで待つ。
	*/
	async waitUntilStop() {
		while (true) {
			await sleep(1);
			if (await this.GetVoltage() < 0.01)
				break;
		}
	}

	/*
	IDを取得する。
	*/
	get id() {
		return super.id;
	}

	/*
	IDを設定する。
	*/
	set id(id) {
		if (!isNumber(id)) {
			throw new Error('列車のIDに数値をセットしてください。');
		}

		super.id = id;
		this.register(this);
	}

	/*
	種別コードを取得する。
	*/
	get code() {
		return this._code;
	}

	/*
	VRMTrainの種別コードを設定する。
	*/
	async setCode(code) {
		this._code = code;
		if (this._client._commandSocket != null) {
			await this.SetTrainCode(this._code);
		}
	}

	/*
	列車番号の文字列を取得する。
	*/
	get number() {
		return this._number;
	}

	/*
	VRMTrainの列車番号の文字列を設定する。
	*/
	async setNumber(number) {
		this._number = number;
		if (this._client._commandSocket != null) {
			await this.SetTrainNumber(this._number);
		}
	}

	/*
	start()のデフォルト加速距離mmを取得する。
	*/
	get startDistance() {
		return this._startDistance;
	}

	/*
	start()のデフォルト加速距離mmを設定する。
	*/
	set startDistance(startDistance) {
		this._startDistance = startDistance;
	}

	/*
	stop()のデフォルト減速距離mmを取得する。
	*/
	get stopDistance() {
		return this._stopDistance;
	}

	/*
	stop()のデフォルト減速距離mmを設定する。
	*/
	set stopDistance(stopDistance) {
		this._stopDistance = stopDistance;
	}

	/*
	start()の走行時のデフォルト電圧を取得する。
	*/
	get voltage() {
		return this._voltage;
	}

	/*
	start()の走行時のデフォルト電圧を設定する。

	走行中なら列車の電圧も即時変更する。
	*/
	async setVoltage(voltage) {
		this._voltage = voltage;
		if (this._client._commandSocket != null) {
			if (await this.GetVoltage() >= 0.01) {
				await this.start();
			}
		}
	}
}


/*
駅のプラットホームのクラス

codesプロパティが空な場合、進入してきたすべての列車をゆっくり停車させる。
codesプロパティが空でない場合、codesプロパティに種別コードが含まれる列車と種別コードの無い列車だけをゆっくり停車させる。
駅に管理されている場合、駅のnumbersプロパティに列車番号が含まれる列車と列車番号の無い列車だけをゆっくり停車させる。
start()メソッドでプラットホームに停車している列車をゆっくり発車させる。
*/
class Platform {
	constructor() {
		this.atses = [null, null];
		this._restart = null;
		this._startDistance = 400;
		this._stopDistance = 550;
		this._train = null;
		this._name = null;
		this._codes = [];
		this._uuid = createUUID();
		this._station = null;
	}

	/*
	プラットホームに列車が停車したことにする。

	プラットホームに登録したATSにより自動的に呼ばれる。
	引数でわたされた列車をこのプラットホームに停車中の列車とする。

	Args:
		train (Train): プラットホームに停車したことにする列車。
	*/
	async enter(train) {
		if (!(train instanceof Train))
			return;

		await navigator.locks.request(this._uuid, lock => {
			this._train = train;
			if (this._name) {
				console.log(`${this._name}.enter()`);
			}
		});
	}

	/*
	プラットホームから列車が発車したことにする。

	プラットホームに登録したATSにより自動的に呼ばれる。
	このプラットホームに停車中の列車は無しになる。
	列車を指定した場合、指定した列車が停車中なら発車したことにする。
	列車を指定しない場合、どの列車が停車中でも発車したことにする。

	Args:
		train (Train): プラットホームから発車したことにする列車。

	Returns:
		Train: プラットホームから発車したことにした列車。なければnullを返す。
	*/
	async leave(train=null) {
		let t = null;
		await navigator.locks.request(this._uuid, lock => {
			if (train == null || train == this._train) {
				t = this._train;
				this._train = null;
				if (this._name) {
					console.log(`${this._name}.leave()`);
				}
			}
		});
		return t;
	}

	/*
	プラットホームから列車を発車させる。

	列車を指定した場合、指定した列車が停車中なら発車させる。
	列車を指定しない場合、どの列車が停車中でも発車させる。

	Args:
		train (Train): プラットホームから発車させる列車。
		distance (float): 発車時の加速距離。省略時はstartdistanceプロパティの値。
		voltage (float): 走行速度の電圧。省略時は列車のvoltageプロパティの値。

	Returns:
		Train: 発車させた列車。なければnullを返す。
	*/
	async start(train=null, distance=null, voltage=null) {
		if (distance == null) {
			distance = this._startDistance;
		}
		let t = await this.leave(train);
		if (t) {
			await t.start(distance, voltage);
		}
		return t;
	}

	async _enterSequence(train) {
		if (this._station == null) {
			if (this._codes.length > 0) {
				if (train.code != null && this._codes.indexOf(train.code) < 0)
					return; // 通過
			}
		} else {
			if (train.number != null && this._station.numbers.indexOf(train.number) < 0)
				return; // 通過
		}
		await train.stop(this._stopDistance);
		await this.enter(train);
		if (this._atses[0] == null || this._atses[1] == null) { // 行き止まり
			await train.Turn();
		}
		if (this._restart != null) {
			await sleep(this._restart);
			await this.start(train);
		}
	}

	async _leaveSequence(train) {
		await this.leave(train);
	}

	/*
	プラットホームの両端のATSのリストを取得する。
	*/
	get atses() {
		return this._atses;
	}

	/*
	プラットホームの両端のATSのリストを設定する。

	プラットホームに入る向きのATS、出る向きのATSの順[□>, □>]。
	終点で片側にしかATSがない場合は[□>, null]または[null, □>]のようにする。
	ATSの向きと反対に走行する列車にも対応しているので、単線の往復走行にも使用できる。
	*/
	set atses(atses) {
		this._atses = atses;
		if (this._atses[0] instanceof ATS) {
			this._atses[0]._forwardEnterPlatforms.push(this)
			this._atses[0]._reverseLeavePlatforms.push(this)
		}
		if (this._atses[1] instanceof ATS) {
			this._atses[1]._forwardLeavePlatforms.push(this)
			this._atses[1]._reverseEnterPlatforms.push(this)
		}
	}

	/*
	停車秒数を取得する。
	*/
	get restart() {
		return this._restart;
	}

	/*
	停車秒数を設定する。

	停車した列車を指定秒数後ゆっくり発車。省略すると停車のまま。
	*/
	set restart(restart) {
		this._restart = restart;
	}

	/*
	発車時の加速距離mmを取得する。
	*/
	get startDistance() {
		return this._startDistance;
	}

	/*
	発車時の加速距離mmを設定する。
	*/
	set startDistance(startDistance) {
		this._startDistance = startDistance;
	}

	/*
	停車時の減速距離mmを取得する。
	*/
	get stopDistance() {
		return this._stopDistance;
	}

	/*
	停車時の減速距離mmを設定する。
	*/
	set stopDistance(stopDistance) {
		this._stopDistance = stopDistance;
	}

	/*
	プラットホームに入っている列車を取得する。
	*/
	get train() {
		return this._train;
	}

	/*
	初期状態でプラットホームに入っている列車を設定する。
	*/
	async setTrain(train) {
		if (!(train instanceof Train))
			return;

		await navigator.locks.request(this._uuid, async lock => {
			this._train = train;
		});
	}

	/*
	デバッグ用にconsole.log()で表示する名前を取得する。
	*/
	get name() {
		return this._name;
	}

	/*
	デバッグ用にconsole.log()で表示する名前を設定する。
	*/
	set name(name) {
		this._name = name;
	}

	/*
	プラットホームに停車させる種別コードのリストを取得する。
	*/
	get codes() {
		return this._codes;
	}
}


/*
閉塞区間のクラス
*/
class Section {
	constructor() {
		this.atses = [null, null];
		this._train = null;
		this._name = null;
		this._uuid = createUUID();
		this._release = null;
	}

	/*
	閉塞区間に列車を進入させる。

	閉塞区間が空ならそのまま走行。処理は呼び出し側に戻る。
	空でないなら空になるまで停車して待つ。処理も空になるまで戻らない。

	Args:
		train (Train): 閉塞区間に進入する列車。
	*/
	async enter(train) {
		if (!(train instanceof Train))
			return;

		await train.stop(null, false);

		await this._acquire(this._uuid); // ロックを取得

		this._train = train;
		if (this._name) {
			console.log(`${this._name}.enter(${train.id})`);
		}

		await train.start();
	}

	/*
	閉塞区間から列車を退出させる。

	列車を指定した場合、指定した列車が在るときだけを閉塞区間から退出させる。
	列車を指定しない場合、どの列車が在っても閉塞区間から退出させる。

	Args:
		train (Train): 閉塞区間から退出する列車。

	Returns:
		Train: 閉塞区間から退出させ列車。なければnullを返す。
	*/
	async leave(train=null) {
		let t = null;
		if (train == null || train == this._train) {
			t = this._train;
			this._train = null;
			if (this._name) {
				console.log(`${this._name}.leave() => ${t.id}`);
			}

			// ロックを解放
			let release = this._release;
			this._release = null;
			if (release) {
				release();
			}
		}
		return t
	}

	async _acquire(name) {
		return new Promise(resolve => {
			let release = null;
			const p = new Promise(res => { release = res; });
			navigator.locks.request(name, lock => { // ロック
				this._release = release;
				resolve(); // 呼び出し側の処理を進める
				return p; // this._release()が実行されるまでロック中のまま
			});
		});
	}

	/*
	閉塞区間の両端のATSのリストを取得する。
	*/
	get atses() {
		return this._atses;
	}

	/*
	閉塞区間の両端のATSのリストを設定する。

	閉塞区間に入る向きのATS、出る向きのATSの順[□>, □>]。
	分岐、合流で複数のATSが端にある場合は[[□>, □>, □>], □>]のようにする。
	終点で片側にしかATSがない場合は[□>, null]または[null, □>]のようにする。
	ATSの向きと反対に走行する列車にも対応しているので、単線の往復走行にも使用できる。
	*/
	set atses(atses) {
		this._atses = atses;
		if (this._atses[0] instanceof Array) {
			for (let ats of this._atses[0]) {
				if (ats instanceof ATS) {
					ats._forwardEnterSections.push(this);
					ats._reverseLeaveSections.push(this);
				} else if (ats != null) {
					throw new Error('閉塞区間にATSをセットしてください。');
				}
			}
		} else if (this._atses[0] instanceof ATS) {
			this._atses[0]._forwardEnterSections.push(this);
			this._atses[0]._reverseLeaveSections.push(this);
		} else if (this._atses[0] != null) {
			throw new Error('閉塞区間にATSをセットしてください。');
		}

		if (this._atses[1] instanceof Array) {
			for (let ats of this._atses[1]) {
				if (ats instanceof ATS) {
					ats._forwardLeaveSections.push(this);
					ats._reverseEnterSections.push(this);
				} else if (ats != null) {
					throw new Error('閉塞区間にATSをセットしてください。');
				}
			}
		} else if (this._atses[1] instanceof ATS) {
			this._atses[1]._forwardLeaveSections.push(this);
			this._atses[1]._reverseEnterSections.push(this);
		} else if (this._atses[1] != null) {
			throw new Error('閉塞区間にATSをセットしてください。');
		}
	}

	/*
	閉塞区間に入っている列車を取得する。
	*/
	get train() {
		return this._train;
	}

	/*
	初期状態で閉塞区間に入っている列車を設定する。
	*/
	async setTrain(train) {
		if (!(train instanceof Train))
			return;

		await this._acquire(this._uuid); // ロックを取得

		this._train = train;
		if (this._name) {
			console.log(`${this._name}.enter(${train.id})`);
		}
	}

	/*
	デバッグ用にconsole.log()で表示する名前を取得する。
	*/
	get name() {
		return this._name;
	}

	/*
	デバッグ用にconsole.log()で表示する名前を設定する。
	*/
	set name(name) {
		this._name = name;
	}
}
