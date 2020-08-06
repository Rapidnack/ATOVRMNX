Blockly.defineBlocksWithJsonArray([
{
  "type": "set_train_id",
  "message0": "列車 %1 のIDに %2 をセット",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "train",
      "variableTypes": ["Train"],
      "defaultType": "Train"
    },
    {
      "type": "field_number",
      "name": "ID",
      "value": 0,
      "min": 0
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "logic_blocks",
  "tooltip": "レイアウトでの列車のIDを調べてセットします。",
  "helpUrl": ""
},
{
  "type": "start_train",
  "message0": "列車 %1 を加速距離 %2 %3 mmで発車",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "train",
      "variableTypes": ["Train"],
      "defaultType": "Train"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "DISTANCE",
      "check": "Number"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "logic_blocks",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "stop_train",
  "message0": "列車 %1 を減速距離 %2 %3 mmで停車",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "train",
      "variableTypes": ["Train"],
      "defaultType": "Train"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "DISTANCE",
      "check": "Number"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "logic_blocks",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "turn_train",
  "message0": "列車 %1 を反転",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "train",
      "variableTypes": ["Train"],
      "defaultType": "Train"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "logic_blocks",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "get_train_direction",
  "message0": "列車 %1 の進行方向",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "train",
      "variableTypes": ["Train"],
      "defaultType": "Train"
    }
  ],
  "output": "Number",
  "style": "logic_blocks",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "set_train_code",
  "message0": "列車 %1 の種別コード(0～7)に %2 をセット",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "train",
      "variableTypes": ["Train"],
      "defaultType": "Train"
    },
    {
      "type": "field_number",
      "name": "CODE",
      "value": 0,
      "min": 0,
      "max": 7
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "logic_blocks",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "get_train_code",
  "message0": "列車 %1 の種別コード(0～7)",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "train",
      "variableTypes": ["Train"],
      "defaultType": "Train"
    }
  ],
  "output": "Number",
  "style": "logic_blocks",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "set_train_number",
  "message0": "列車 %1 の列車番号を %2 %3 にセット",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "train",
      "variableTypes": ["Train"],
      "defaultType": "Train"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "NUMBER",
      "check": "String"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "logic_blocks",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "get_train_number",
  "message0": "列車 %1 の列車番号",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "train",
      "variableTypes": ["Train"],
      "defaultType": "Train"
    }
  ],
  "output": "String",
  "style": "logic_blocks",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "set_train_traveling_voltage",
  "message0": "列車 %1 の走行時の電圧(0.0～1.0)に %2 %3 をセット",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "train",
      "variableTypes": ["Train"],
      "defaultType": "Train"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "VOLTAGE",
      "check": "Number"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "logic_blocks",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "get_train_voltage",
  "message0": "列車 %1 の現在の電圧(0.0～1.0)",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "train",
      "variableTypes": ["Train"],
      "defaultType": "Train"
    }
  ],
  "output": null,
  "style": "logic_blocks",
  "tooltip": "",
  "helpUrl": ""
},

{
  "type": "set_point_id",
  "message0": "ポイント %1 のIDに %2 をセット",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "point",
      "variableTypes": ["Point"],
      "defaultType": "Point"
    },
    {
      "type": "field_number",
      "name": "ID",
      "value": 0,
      "min": 0
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "loop_blocks",
  "tooltip": "レイアウトでのポイントのIDを調べてセットします。",
  "helpUrl": ""
},
{
  "type": "set_point_branch",
  "message0": "ポイント %1 の分岐状態(0で直進)に %2 %3 をセット",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "point",
      "variableTypes": ["Point"],
      "defaultType": "Point"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "BRANCH",
      "check": "Number"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "loop_blocks",
  "tooltip": "２分岐ポイントの場合、０で直進、１で分岐です。",
  "helpUrl": ""
},
{
  "type": "switch_point_branch",
  "message0": "ポイント %1 の分岐状態(0で直進)を順次切り替え",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "point",
      "variableTypes": ["Point"],
      "defaultType": "Point"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "loop_blocks",
  "tooltip": "２分岐ポイントの場合、０で直進、１で分岐です。",
  "helpUrl": ""
},
{
  "type": "get_point_branch",
  "message0": "ポイント %1 の分岐状態(0で直進)",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "point",
      "variableTypes": ["Point"],
      "defaultType": "Point"
    }
  ],
  "output": "Number",
  "style": "loop_blocks",
  "tooltip": "２分岐ポイントの場合、０で直進、１で分岐です。",
  "helpUrl": ""
},

{
  "type": "set_ats_id",
  "message0": "ATS %1 のIDに %2 をセット",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "ats",
      "variableTypes": ["ATS"],
      "defaultType": "ATS"
    },
    {
      "type": "field_input",
      "name": "ID",
      "text": "0"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "math_blocks",
  "tooltip": "レイアウトでのATSのIDを調べてセットします。一か所に複数のATSを配置した場合、「80,90,100」のようにIDをカンマで繋ぎます。",
  "helpUrl": ""
},
{
  "type": "catch_event_handler",
  "message0": "ATS %1 が %2 の列車を検出したとき実行 　引数： %3 %4 %5",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "ats",
      "variableTypes": ["ATS"],
      "defaultType": "ATS"
    },
    {
      "type": "field_dropdown",
      "name": "DIRECTION",
      "options": [
        [
          "順方向",
          "FORWARD"
        ],
        [
          "逆方向",
          "REVERSE"
        ]
      ]
    },
    {
      "type": "field_variable",
      "name": "TRAIN",
      "variable": "列車",
      "variableTypes": ["Train"],
      "defaultType": "Train"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "STATEMENTS"
    }
  ],
  "style": "math_blocks",
  "tooltip": "",
  "helpUrl": ""
},

{
  "type": "set_platform_atses",
  "message0": "プラットホーム %1 の両端にATS %2 %3 とATS %4 %5 をセット",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "platform",
      "variableTypes": ["Platform"],
      "defaultType": "Platform"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "ATSIN",
      "check": "ATS"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "ATSOUT",
      "check": "ATS"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "text_blocks",
  "tooltip": "ATSをセットすると列車を自動で停車させます。片方のみ指定した場合、停止後進行方向を自動で反転します。",
  "helpUrl": ""
},
{
  "type": "set_platform_restart",
  "message0": "プラットホーム %1 の停車時間に %2 %3 秒をセット",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "platform",
      "variableTypes": ["Platform"],
      "defaultType": "Platform"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "SECONDS",
      "check": "Number"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "text_blocks",
  "tooltip": "停車時間を指定しない場合、停車したままになります。",
  "helpUrl": ""
},
{
  "type": "set_platform_train",
  "message0": "プラットホーム %1 の初期状態に列車 %2 %3 をセット",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "platform",
      "variableTypes": ["Platform"],
      "defaultType": "Platform"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "TRAIN",
      "check": "Train"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "text_blocks",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "start_platform",
  "message0": "プラットホーム %1 から列車 %2 %3 を発車",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "platform",
      "variableTypes": ["Platform"],
      "defaultType": "Platform"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "TRAIN",
      "check": "Train"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "text_blocks",
  "tooltip": "列車の指定を省略できます。",
  "helpUrl": ""
},
{
  "type": "set_platform_codes",
  "message0": "プラットホーム %1 の種別コードリストに %2 をセット",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "platform",
      "variableTypes": ["Platform"],
      "defaultType": "Platform"
    },
    {
      "type": "field_input",
      "name": "CODES",
      "text": "0,1,2,3,4,5,6,7"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "text_blocks",
  "tooltip": "停車させる列車の種別コードをカンマで繋いで指定します。何も指定しない場合、すべての列車を停止させます。",
  "helpUrl": ""
},

{
  "type": "set_section_atses",
  "message0": "閉塞区間 %1 の両端にATS %2 %3 とATS %4 %5 をセット",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "section",
      "variableTypes": ["Section"],
      "defaultType": "Section"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "ATSIN",
      "check": "Array"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "ATSOUT",
      "check": "Array"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "list_blocks",
  "tooltip": "ATSをセットすると「列車を入れる」「列車を出す」を自動で実行します。それぞれ複数のATSをセットできます。",
  "helpUrl": ""
},
{
  "type": "set_section_train",
  "message0": "閉塞区間 %1 の初期状態に列車 %2 %3 をセット",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "section",
      "variableTypes": ["Section"],
      "defaultType": "Section"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "TRAIN",
      "check": "Train"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "list_blocks",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "enter_section",
  "message0": "閉塞区間 %1 に列車 %2 %3 を入れる",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "section",
      "variableTypes": ["Section"],
      "defaultType": "Section"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "TRAIN",
      "check": "Train"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "list_blocks",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "leave_section",
  "message0": "閉塞区間 %1 から列車 %2 %3 を出す",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "section",
      "variableTypes": ["Section"],
      "defaultType": "Section"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "TRAIN",
      "check": "Train"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "list_blocks",
  "tooltip": "列車の指定を省略できます。",
  "helpUrl": ""
},
{
  "type": "enable_section_log",
  "message0": "閉塞区間 %1 をログに出力",
  "args0": [
    {
      "type": "field_variable",
      "name": "VAR",
      "variable": "section",
      "variableTypes": ["Section"],
      "defaultType": "Section"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "list_blocks",
  "tooltip": "",
  "helpUrl": ""
},

{
  "type": "main_function",
  "message0": "アドレス %1 に接続して実行 %2 %3",
  "args0": [
    {
      "type": "field_input",
      "name": "ADDRESS",
      "text": "127.0.0.1"
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "STATEMENTS"
    }
  ],
  "style": "colour_blocks",
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "sleep_seconds",
  "message0": "%1 秒待つ",
  "args0": [
    {
      "type": "input_value",
      "name": "SECONDS",
      "check": "Number",
      "align": "RIGHT"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "colour_blocks",
  "tooltip": "",
  "helpUrl": ""
}
]);