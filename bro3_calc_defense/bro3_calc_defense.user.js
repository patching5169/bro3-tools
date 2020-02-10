// ==UserScript==
// @name		bro3_calc_defense
// @namespace	https://github.com/RAPT21/bro3-tools/
// @description	<内蔵版>ブラ三 領地民兵計算機 by BSE with RAPT
// @include		http://*.3gokushi.jp/land.php*
// @require		https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @grant		none
// @author		BSE with RAPT
// @version 	1.6.1.31
// ==/UserScript==

// 配布サイト
// https://github.com/RAPT21/bro3-tools/

// ----- BSE 版リリースノート -----
//	2016.03.13 Ver1.6.1 リリース
// ----- 改修リリースノート -----
//	2016.08.20 v1.6.1.1 初版作成。【注意】本スクリプトの内容について BSE 氏に問い合わせないでください。
//	2016.10.20 v1.6.1.2 y9,y31,y34 鯖対応
//	2016.11.16 v1.6.1.3 y1,y17,y33 鯖対応
//	2016.11.30 v1.6.1.4 y29 鯖対応
//	2016.12.06 v1.6.1.5 f1,y25 鯖対応
//	2017.01.26 v1.6.1.6 k-1t マップ対応、y9 鯖対応
//	2017.02.15 v1.6.1.7 y31 鯖対応
//	2017.03.02 v1.6.1.8 y1,y35 鯖対応
//	2017.03.16 v1.6.1.9 y33 鯖対応
//	2017.03.22 v1.6.1.10 y17 鯖対応
//	2017.04.26 v1.6.1.11 y25,y29 鯖対応
//	2017.06.07 v1.6.1.12 y31 鯖対応
//	2017.06.29 v1.6.1.13 y1,y9,y35 鯖対応
//	2017.07.12 v1.6.1.14 y33,y36 鯖対応
//	2017.09.26 v1.6.1.15 y17,y25 鯖対応
//	2017.09.28 v1.6.1.16 y29 鯖対応
//	2017.10.25 v1.6.1.17 y1,y9,y35 鯖対応
//	2017.12.06 v1.6.1.18 y17,y33,y36 鯖対応
//	2018.02.19 v1.6.1.19 y1,y9,y25,y29,y37 鯖対応
//	2018.04.22 v1.6.1.20 y17,y25,y33,y35,y37 鯖対応
//	2018.05.13 v1.6.1.21 k-1t は現状 25 期まで運用されている模様
//	2018.07.25 v1.6.1.22 y1,y9,y29,y35,y38,y39 鯖対応
//	2018.08.08 v1.6.1.23 y33 鯖対応
//	2018.08.22 v1.6.1.24 y17,y37 鯖対応
//	2018.09.06 v1.6.1.25 y38 鯖対応
//	2018.09.11 v1.6.1.26 y29 鯖対応
//	2018.09.19 v1.6.1.27 y25,y29 鯖対応
//	2018.11.16 v1.6.1.28 y1,y9,y39,y40 鯖対応
//	2018.12.16 v1.6.1.29 y33,y39 鯖について対応状況コメント記載
//	2019.05.16 v1.6.1.30 今はすべて x-nt から x-ns に変更されているはずなので定義を切り替え
//	2020.02.10 v1.6.1.31 w鯖+斧双錘兵科対応(ほとんどのMAP情報が欠損しています。。w26鯖は本来a-1vですが、a-1sを準用しています。参考程度に。)

jQuery.noConflict();
q$ = jQuery;

//バージョン配置用
var ver_rack = "ver1.6.1.31";

//配布管理系
var nazeka ="<span style='color:crimson'>■</span>";
var se_rack = "<span style='color:silver'>&lt;内蔵版&gt;ブラ三 領地民兵計算機 by BSE " + ver_rack + " with RAPT</span>";
var url_rack = "http://dev.3g-ws.com/";
var com_rack = nazeka + "【Map x-xx】"+nazeka;
var img_URL = "http://ms.3g-ws.com/calc/i-1t31.png";
var img_alt = "※※非常連絡用※※";
var img_txt = "<span style='color:white'>←青ロゴ：通常　　緑ロゴ：一部に異常　　赤ロゴ：異常事態</span>\n";

var NPC_HOLDER	 = "NPC拠点：<span style='color:red; font-weight:bold;'>NPC拠点と推測されます。中身をうかがい知ることは出来ません。</span>";
var PLAYER_HOLDER = "君主城：プレイヤー本拠地&nbsp;<span style='color:red; font-weight:bold;'>誰かの本拠地と推測されます。中身をうかがい知ることは出来ません。</span>";

//　出兵距離格納変数
var kyori;

var tocordx;
var tocordy;
var HOST = location.hostname;

//　出兵先のタイル数格納変数（平地、木、岩、鉄、穀、荒地）の順。
var tile = new Array(0,0,0,0,0,0);

// 鯖 - 期
var server_session = {
	"w1": 31,
	"w3": 28,
	"w4": 24,
	"w7": 19,
	"w11": 15,
	"w16": 11,
	"w20": 7,
	"w22": 5,
	"w24": 3,
	"w25": 2,
	"w26": 1
};

// マップタイプ - 期(2020/01/30～に開始する鯖に適用)
var maptype_session = {
	"a-2v": [1],
	"b-2v": [2],
	"c-2v": [3,4],
	"d-2v": [5,6],
	"e-2v": [7,8,9],
	"f-2v": [10,11,12],
	"g-2v": [13,14,15],
	"h-2v": [16,17],
	"i-2v": [18,19],
	"j-2v": [20,21],
	"k-2v": [22,23],
	"l-2v": [24,25],
	"m-2v": [26,27,28,29,30,31]
};

// 移行中対応
var server_maptype = {
	"w1": "m-2v",	// ○
	"w3": "m-1v",
	"w4": "l-1v",	// ○
	"w7": "i-1v",
	"w11": "g-1v",
	"w16": "f-2v",
	"w20": "e-2v",
	"w22": "d-1v",
	"w24": "c-1v",
	"w25": "b-1v",
	"w26": "a-1s"	// a-1v 未実装のため。
};


/*

a-1s
k-1v
l-1v
m-2v
k-1s

*/

//　出兵先のパネル構成ごとの兵数計算パラメータ
var point_list = [
	{"type":"a-1s","data":[
		// a-1s-2018-1113-0007版
		["☆1(1-0-0-0)",5,0,0,0,0,0,0,0,0,0,0,0,0],
		["☆1(0-1-0-0)",5,0,0,0,0,0,0,0,0,0,0,0,0],
		["☆1(0-0-1-0)",5,0,0,0,0,0,0,0,0,0,0,0,0],
		["☆1(0-0-0-1)",5,0,0,0,0,0,0,0,0,0,0,0,0],
		["☆2(3-0-0-0)",0,0,0.5,4,0.5,0,0,0,0,0,0,0,0],
		["☆2(0-0-3-0)",0,0,0.5,0.5,4,0,0,0,0,0,0,0,0],
		["☆2(0-3-0-0)",0,0,4,0.5,0.5,0,0,0,0,0,0,0,0],
		["☆3(0-0-0-4)",0,12,2,2,2,0,0,0,0,0,0,0,0],
		["☆3(1-1-1-0)",0,0,6,6,6,0,0,0,0,0,0,0,0],
		["☆3(1-1-1-1)",0,5,13.5,13.5,13.5,0,0,0,0,0,0,0,0],
		["☆4(0-0-0-8)",0,16.5,7,7,7,0,0,0,0,0,0,0,0],
		["☆4(2-2-2-2)",0,7.5,8.5,8.5,8.5,0,0,0,0,0,0,0,0],
		["☆4(2-2-2-0)",0,0,12.5,12.5,12.5,0,0,0,0,0,0,0,0],
		["☆5(6-0-0-0)",0,0,10,40,10,0,0,0,0,0,0,0,0],
		["☆5(0-6-0-0)",0,0,40,10,10,0,0,0,0,0,0,0,0],
		["☆5(0-0-6-0)",0,0,10,10,40,0,0,0,0,0,0,0,0],
		["☆6(0-10-0-0)",0,0,75,15,15,0,0,0,0,0,0,0,0],
		["☆6(0-0-10-0)",0,0,15,15,75,0,0,0,0,0,0,0,0],
		["☆6(10-0-0-0)",0,0,15,75,15,0,0,0,0,0,0,0,0],
		["☆7(3-3-3-0)",0,0,0,0,0,0,0,50,50,50,0,0,0],
		["☆8(4-4-4-4)",0,0,0,0,0,0,75,60,60,60,15,15,15],
		["☆9(0-0-0-18)",0,0,0,0,0,0,190,55,55,55,42.5,42.5,42.5],
		["☆0(3-3-3-3)"+PLAYER_HOLDER]
	]}, {"type":"k-1v","data":[
		// k-1v-(20191008-0400調査完了版
		["☆1(2-0-0-0)兵種確認のみ",2,0,0,7.5,0,0,0,0,0,0,0,0,0],//兵種確認のみ
		["☆1(0-2-0-0)確定",2,0,7.5,0,0,0,0,0,0,0,0,0,0],//確定
		["☆1(0-0-2-0)兵種確認のみ",2,0,0,0,7.5,0,0,0,0,0,0,0,0],//兵種確認のみ
		["☆1(0-0-0-2)兵種確認のみ",2,7.5,0,0,0,0,0,0,0,0,0,0,0],//兵種確認のみ
		["☆1(1-0-0-0)確定",12,0,0,0,0,0,0,0,0,0,0,0,0],//確定
		["☆1(0-1-0-0)確定",12,0,0,0,0,0,0,0,0,0,0,0,0],//確定
		["☆1(0-0-1-0)確定",12,0,0,0,0,0,0,0,0,0,0,0,0],//確定
		["☆1(0-0-0-1)確定",12,0,0,0,0,0,0,0,0,0,0,0,0],//確定
		["☆2(3-0-0-0)パターン適用",0,0,8.5,87.5,8.5,0,0,0,0,0,0,0,0],//パターン適用
		["☆2(0-3-0-0)確定",0,0,87.5,8.5,8.5,0,0,0,0,0,0,0,0],//確定
		["☆2(0-0-3-0)パターン適用",0,0,8.5,8.5,87.5,0,0,0,0,0,0,0,0],//パターン適用
		["☆2(2-0-0-1)確定",0,30.5,0,102,0,0,0,0,0,0,0,11.5,0],//確定
		["☆2(0-2-0-1)パターン適用",0,30.5,102,0,0,0,0,0,0,0,11.5,0,0],//パターン適用
		["☆2(0-0-2-1)パターン適用",0,30.5,0,0,102,0,0,0,0,0,0,0,11.5],//パターン適用
		["☆3(1-1-1-1)確定",0,84.5,116,116,116,0,0,0,0,0,0,0,0],//確定
		["☆3(0-0-0-1)確定",0,254,46.5,46.5,46.5,0,0,0,0,0,0,0,0],//確定
		["☆3(1-1-1-0)確定",0,0,133.5,133.5,133.5,0,0,0,0,0,0,0,0],//確定
		["☆3(2-0-0-2)パターン適用",0,119,34,327,34,0,0,0,0,0,0,29,0],//パターン適用
		["☆3(0-2-0-2)確定？",0,119,327,34,34,0,0,0,0,0,29,0,0],//確定？
		["☆3(0-0-2-2)パターン適用",0,119,34,34,327,0,0,0,0,0,0,0,29],//パターン適用
		["☆4(1-1-1-1)確定",0,401,180.5,180.5,180.5,0,0,0,0,0,0,0,0],//確定
		["☆4(0-0-0-8)確定",0,509.5,130,130,130,0,0,0,0,0,0,0,0],//確定
		["☆4(2-2-2-2)確定",0,217,227.5,227.5,227.5,0,0,0,0,0,0,0,0],//確定
		["☆4(2-2-2-0)確定",0,0,292.5,292.5,292.5,0,0,0,0,0,0,0,0],//確定
		["☆5(1-1-1-1)多分",0,410,405.5,405.5,405.5,0,0,0,0,0,0,0,0],//多分
		["☆5(0-0-0-1)確定",0,926.5,233.5,233.5,233.5,0,0,0,0,0,0,0,0],//確定
		["☆5(6-0-0-0)確定",0,0,298,998,298,0,0,0,0,0,0,0,0],//確定
		["☆5(0-6-0-0)パターン適用",0,0,998,298,298,0,0,0,0,0,0,0,0],//パターン適用
		["☆5(0-0-6-0)パターン適用",0,0,298,298,998,0,0,0,0,0,0,0,0],//パターン適用
		["☆6(10-0-0-0)パターン適用",0,0,0,0,0,0,0,412,1476.5,412,0,257,0],//パターン適用
		["☆6(0-10-0-0)確定",0,0,0,0,0,0,0,1476.5,412,412,257,0,0],//確定
		["☆6(0-0-10-0)パターン適用",0,0,0,0,0,0,0,412,412,1476.5,0,0,257],//パターン適用
		["☆6(0-0-0-0)仮確定",0,0,0,0,0,0,0,781,781,781,0,0,0],//仮確定
		["☆7(4-4-2-0)矛に異説あり",0,0,0,0,0,0,0,748,1506.5,1506.5,0,410,410],//矛に異説あり
		["☆7(4-2-4-0)確定",0,0,0,0,0,0,0,1394,1394,1394,0,0,0],//確定
		["☆7(2-4-4-0)確定",0,0,0,0,0,0,0,1506.5,1506.5,748,410,410,0],//確定
		["☆7(0-0-0-0)確定",0,0,0,0,0,0,0,1506.5,748,1506.5,410,0,410],//確定
		["☆7(0-0-0-12)確定",0,0,0,0,0,0,2121.5,686.5,686.5,686.5,0,0,0],//確定
		["☆8(4-4-5-2)確定",0,0,0,0,0,0,460.5,1048.5,1048.5,1615,283.5,283.5,354],//確定
		["☆8(5-4-4-2)パターン適用",0,0,0,0,0,0,460.5,1048.5,1615,1048.5,283.5,354,283.5],//パターン適用
		["☆8(4-5-4-2)パターン適用",0,0,0,0,0,0,460.5,1615,1048.5,1048.5,354,283.5,283.5],//パターン適用
		["☆8(18-0-0-0)確定",0,0,0,0,0,0,1140.5,1431,1076.5,1076.5,1579.5,0,0],//確定
		["☆8(0-18-0-0)確定",0,0,0,0,0,0,1140.5,1431,1076.5,1076.5,0,1579.5,0],//確定
		["☆8(0-0-18-0)確定",0,0,0,0,0,0,1140.5,1431,1076.5,1076.5,0,0,1579.5],//確定
		["☆8(0-0-0-15)確定",0,0,0,0,0,0,2344.5,892.5,892.5,892.5,234,234,234],//確定
		["☆8(0-0-0-0)確定",0,0,0,0,0,0,1339,1339,1339,1339,396.5,396.5,396.5],//確定
		["☆9(7-0-0-4)パターン適用",0,0,0,0,0,0,3398,709,5097,709,0,2881,0],//パターン適用
		["☆9(0-7-0-4)パターン適用",0,0,0,0,0,0,3398,5097,709,709,2881,0,0],//パターン適用
		["☆9(0-0-7-4)確定",0,0,0,0,0,0,3398,709,709,5097,0,0,2881],//確定
		["☆9(0-0-0-0)確定",0,0,0,0,0,0,1256,3915,3915,3915,960.5,960.5,960.5],//確定
		["☆9(2-2-2-2)確定",0,0,0,0,0,0,4063,4063,4063,4063,258.5,258.5,258.5],//確定
		["☆9(3-3-3-3)確定",0,0,0,0,0,0,2659.5,2659.5,2659.5,2659.5,1034,1034,1034],//確定
		["☆9(4-4-4-7)計算ミスってましたごめんなさい",0,0,0,0,0,0,3915,3028.5,3028.5,3028.5,1337,1337,1337]//計算ミスってましたごめんなさい
		["☆0(3-3-3-3)"+PLAYER_HOLDER]
	]}, {"type":"l-1v","data":[
		// l-1v-(20190929-確報CVb)
		["☆1(2-0-0-0)",2.5,0,0,9.5,0,0,0,0,0,0,0,0,0],//
		["☆1(0-2-0-0)",2.5,0,9.5,0,0,0,0,0,0,0,0,0,0],//
		["☆1(0-0-2-0)",2.5,0,0,0,9.5,0,0,0,0,0,0,0,0],//
		["☆1(0-0-0-2)",2.5,9.5,0,0,0,0,0,0,0,0,0,0,0],//
		["☆1(1-0-0-0)",14,0,0,0,0,0,0,0,0,0,0,0,0],//
		["☆1(0-1-0-0)",14,0,0,0,0,0,0,0,0,0,0,0,0],//
		["☆1(0-0-1-0)",14,0,0,0,0,0,0,0,0,0,0,0,0],//
		["☆1(0-0-0-1)",14,0,0,0,0,0,0,0,0,0,0,0,0],//
		["☆2(3-0-0-0)確定",0,0,10,109,10,0,0,0,0,0,0,0,0],//確定
		["☆2(0-3-0-0)準用",0,0,109,10,10,0,0,0,0,0,0,0,0],//準用
		["☆2(0-0-3-0)準用",0,0,10,10,109,0,0,0,0,0,0,0,0],//準用
		["☆2(2-0-0-1)",0,38,0,0,0,0,0,0,0,0,0,14,0],//
		["☆2(0-2-0-1)",0,38,0,0,0,0,0,0,0,0,14,0,0],//
		["☆2(0-0-2-1)確定",0,38,0,0,0,0,0,0,0,0,0,0,14],//確定
		["☆3(1-1-1-1)確定",0,101,139,139,139,0,0,0,0,0,0,0,0],//確定
		["☆3(0-0-0-1)確定",0,304.5,55.5,55.5,55.5,0,0,0,0,0,0,0,0],//確定
		["☆3(1-1-1-0)確定",0,0,160,160,160,0,0,0,0,0,0,0,0],//確定
		["☆3(2-0-0-2)",0,143,40.5,392,40.5,0,0,0,0,0,0,34.5,0],//
		["☆3(0-2-0-2)確定",0,143,392,40.5,40.5,0,0,0,0,0,34.5,0,0],//確定
		["☆3(0-0-2-2)",0,143,40.5,40.5,392,0,0,0,0,0,0,0,34.5],//
		["☆4(1-1-1-1)確定",0,500.5,225,225,225,0,0,0,0,0,0,0,0],//確定
		["☆4(0-0-0-8)確定",0,636.5,162,162,162,0,0,0,0,0,0,0,0],//確定
		["☆4(2-2-2-2)確定",0,271.5,284.5,284.5,284.5,0,0,0,0,0,0,0,0],//確定
		["☆4(2-2-2-0)確定",0,0,366.5,366.5,366.5,0,0,0,0,0,0,0,0],//確定
		["☆5(1-1-1-1)確定",0,512,506.5,506.5,506.5,0,0,0,0,0,0,0,0],//確定
		["☆5(0-0-0-1)確定",0,1157.5,292,292,292,0,0,0,0,0,0,0,0],//確定
		["☆5(6-0-0-0)準用",0,0,372,1248,372,0,0,0,0,0,0,0,0],//準用
		["☆5(0-6-0-0)確定",0,0,1248,372,372,0,0,0,0,0,0,0,0],//確定
		["☆5(0-0-6-0)準用",0,0,372,372,1248,0,0,0,0,0,0,0,0],//準用
		["☆6(10-0-0-0)確定",0,0,0,0,0,0,0,514.5,1845.5,514.5,0,320.5,0],//確定
		["☆6(0-10-0-0)推定",0,0,0,0,0,0,0,1845.5,514.5,514.5,320.5,0,0],//推定
		["☆6(0-0-10-0)確定",0,0,0,0,0,0,0,514.5,514.5,1845.5,0,0,320.5],//確定
		["☆6(0-0-0-0)確定",0,0,0,0,0,0,0,976,976,976,0,0,0],//確定
		["☆7(4-4-2-0)",0,0,0,0,0,0,0,935,1883,1883,0,512,512],//
		["☆7(4-2-4-0)推定",0,0,0,0,0,0,0,935,1883,1883,512,0,512],//推定
		["☆7(2-4-4-0)確定",0,0,0,0,0,0,0,1883,1883,935,512,512,0],//確定
		["☆7(0-0-0-0)確定",0,0,0,0,0,0,0,1883,935,1883,512,0,512],//確定
		["☆7(0-0-0-12)確定",0,0,0,0,0,0,2652,858,858,858,0,0,0],//確定
		["☆8(4-4-5-2)確定",0,0,0,0,0,0,575.5,1310,1310,2018.5,354,354,442.5],//確定
		["☆8(5-4-4-2)確定",0,0,0,0,0,0,575.5,1310,2018.5,1310,354,442.5,354],//確定
		["☆8(4-5-4-2)推定",0,0,0,0,0,0,575.5,2018.5,1310,1310,442.5,354,354],//推定
		["☆8(18-0-0-0)",0,0,0,0,0,0,1425.5,1788.5,1345.5,1345.5,1974,0,0],//
		["☆8(0-18-0-0)確定",0,0,0,0,0,0,1425.5,1788.5,1345.5,1345.5,0,1974,0],//確定
		["☆8(0-0-18-0)",0,0,0,0,0,0,1425.5,1788.5,1345.5,1345.5,0,0,1974],//
		["☆8(0-0-0-15)確定",0,0,0,0,0,0,2930.5,1115.5,1115.5,1115.5,292,292,292],//確定
		["☆8(0-0-0-0)確定",0,0,0,0,0,0,1673,1673,1673,1673,495.5,495.5,495.5],//確定
		["☆9(7-0-0-4)確定",0,0,0,0,0,0,4417,921.5,6626,921.5,0,3745,0],//確定
		["☆9(0-7-0-4)",0,0,0,0,0,0,4417,6626,921.5,921.5,3745,0,0],//
		["☆9(0-0-7-4)",0,0,0,0,0,0,4417,921.5,921.5,6626,0,0,3745],//
		["☆9(0-0-0-0)確定",0,0,0,0,0,0,1632.5,5089.5,5089.5,5089.5,1248,1248,1248],//確定
		["☆9(2-2-2-2)確定",0,0,0,0,0,0,5281.5,5281.5,5281.5,5281.5,336,336,336],//確定
		["☆9(3-3-3-3)確定",0,0,0,0,0,0,3457,3457,3457,3457,1344,1344,1344],//確定
		["☆9(4-4-4-7)確定",0,0,0,0,0,0,5089.5,3937,3937,3937,1738,1738,1738]//確定
		["☆0(3-3-3-3)"+PLAYER_HOLDER]
	]}, {"type":"m-2v","data":[
		// M-2v-(20200208-1548確定)
		["☆1(1-0-0-0)",16.5,0,0,0,0,0,0,0,0,0,0,0,0],
		["☆1(0-1-0-0)",16.5,0,0,0,0,0,0,0,0,0,0,0,0],
		["☆1(0-0-1-0)",16.5,0,0,0,0,0,0,0,0,0,0,0,0],
		["☆1(0-0-0-1)",16.5,0,0,0,0,0,0,0,0,0,0,0,0],
		["☆1(2-0-0-0)",3,0,2,7,2,0,0,0,0,0,0,0,0],
		["☆1(0-2-0-0)",3,0,7,2,2,0,0,0,0,0,0,0,0],
		["☆1(0-0-2-0)",3,0,2,2,7,0,0,0,0,0,0,0,0],
		["☆1(0-0-0-2)",3,6.5,1.5,1.5,1.5,0,0,0,0,0,0,0,0],
		["☆2(3-0-0-0)",0,30,0,100,0,0,0,0,0,0,0,20,0],
		["☆2(0-3-0-0)",0,30,100,0,0,0,0,0,0,0,27.5,0,0],
		["☆2(0-0-3-0)",0,30,0,0,100,0,0,0,0,0,0,0,25],
		["☆2(2-0-0-1)",0,60,0,45,0,0,0,0,0,0,0,25,0],
		["☆2(0-2-0-1)",0,60,45,0,0,0,0,0,0,0,35,0,0],
		["☆2(0-0-2-1)",0,60,0,0,45,0,0,0,0,0,0,0,30],
		["☆3(1-1-1-1)",0,190,150,150,150,0,0,0,0,0,30,15,25],
		["☆3(0-0-0-1)",0,50,200,200,200,0,0,0,0,0,30,15,25],
		["☆3(1-1-1-0)",0,55,225,225,225,0,0,0,0,0,30,15,25],
		["☆3(2-0-0-2)",0,125,0,375,0,0,0,0,0,0,0,100,0],
		["☆3(0-2-0-2)",0,125,375,0,0,0,0,0,0,0,140,0,0],
		["☆3(0-0-2-2)",0,125,0,0,375,0,0,0,0,0,0,0,120],
		["☆4(1-1-1-1)",0,100,400,400,400,0,0,0,0,0,65,35,50],
		["☆4(0-0-0-8)",0,550,225,225,225,0,0,0,0,0,65,35,50],
		["☆4(2-2-2-2)",0,350,300,300,300,0,0,0,0,0,65,35,50],
		["☆4(2-2-2-0)",0,100,450,450,450,0,0,0,0,0,65,35,50],
		["☆5(0-0-0-1)",0,0,0,0,0,0,160,240,240,240,95,45,70],
		["☆5(6-0-0-0)",0,0,0,0,0,0,185,0,555,0,0,230,0],
		["☆5(0-6-0-0)",0,0,0,0,0,0,185,0,0,465,0,0,310],
		["☆5(0-0-6-0)",0,0,0,0,0,0,185,385,0,0,385,0,0],
		["☆5(1-1-1-1)",0,0,0,0,0,0,190,190,190,190,95,45,70],
		["☆6(10-0-0-0)",0,0,0,0,0,0,850,0,2500,0,0,1050,0],
		["☆6(0-10-0-0)",0,0,0,0,0,0,850,0,0,2100,0,0,1400],
		["☆6(0-0-10-0)",0,0,0,0,0,0,850,1750,0,0,1750,0,0],
		["☆6(0-0-0-0)",0,0,0,0,0,0,750,1150,1150,1150,450,200,300],
		["☆7(4-4-2-0)",0,0,0,0,0,0,1625,1625,1625,250,1250,1250,0],
		["☆7(4-2-4-0)",0,0,0,0,0,0,1625,250,1625,1625,0,750,1750],
		["☆7(2-4-4-0)",0,0,0,0,0,0,1625,1625,250,1625,2000,0,500],
		["☆7(0-0-0-0)",0,0,0,0,0,0,1250,1850,1850,1850,750,350,550],
		["☆7(0-0-0-12)",0,0,0,0,0,0,2500,1050,1050,1050,1250,300,600],
		["☆8(4-4-5-2)",0,0,0,0,0,0,2400,2150,2150,2900,1100,500,1100],
		["☆8(5-4-4-2)",0,0,0,0,0,0,2400,2150,2900,2150,1100,800,800],
		["☆8(4-5-4-2)",0,0,0,0,0,0,2400,2900,2150,2150,1400,500,800],
		["☆8(18-0-0-0)",0,0,0,0,0,0,2400,0,7000,0,0,3000,0],
		["☆8(0-18-0-0)",0,0,0,0,0,0,2400,0,0,6000,0,0,4000],
		["☆8(0-0-18-0)",0,0,0,0,0,0,2400,5000,0,0,0,0,5000],
		["☆8(0-0-0-15)",0,0,0,0,0,0,4000,1750,1750,1750,2000,500,1000],
		["☆8(0-0-0-0)",0,0,0,0,0,0,2000,3000,3000,3000,1200,600,900],
		["☆9(7-0-0-4)",0,0,0,0,0,0,7500,1500,15000,1500,0,5000,0],
		["☆9(0-7-0-4)",0,0,0,0,0,0,7500,10000,1500,1500,10000,0,0],
		["☆9(0-0-7-4)",0,0,0,0,0,0,7500,1500,1500,12500,0,0,7500],
		["☆9(0-0-0-0)",0,0,0,0,0,0,5000,7500,7500,7500,3000,1500,2250],
		["☆9(1-0-0-0)",0,0,0,0,0,0,6000,0,17500,0,0,7500,0],
		["☆9(0-1-0-0)",0,0,0,0,0,0,6000,12500,0,0,12500,0,0],
		["☆9(0-0-1-0)",0,0,0,0,0,0,6000,0,0,15000,0,0,10000],
		["☆9(4-4-4-7)",0,0,0,0,0,0,6000,6000,6000,6000,3000,1500,2250]
		["☆0(3-3-3-3)"+PLAYER_HOLDER]
	]}, {"type":"k-1s","data":[
		// k-1s-(20181201-1450)
		["☆1(0-2-0-0)準用",22.5,0,0,0,0,0,0,0,0,0,0,0,0],//準用
		["☆1(0-0-2-0)確定",22.5,0,0,0,0,0,0,0,0,0,0,0,0],//確定
		["☆1(2-0-0-0)準用",22.5,0,0,0,0,0,0,0,0,0,0,0,0],//準用
		["☆1(0-0-0-2)確定",22.5,0,0,0,0,0,0,0,0,0,0,0,0],//確定
		["☆2(3-0-0-0)確定",0,0,5,53,5,0,0,0,0,0,0,0,0],//確定
		["☆2(0-3-0-0)確定",0,0,53,5,5,0,0,0,0,0,0,0,0],//確定
		["☆2(0-0-3-0)確定",0,0,5,5,53,0,0,0,0,0,0,0,0],//確定
		["☆2(2-0-0-1)推定？",0,18.5,0,62,0,0,0,0,0,0,0,7,0],//推定？
		["☆2(0-2-0-1)確定",0,18.5,62,0,0,0,0,0,0,0,7,0,0],//確定
		["☆2(0-0-2-1)推定？",0,18.5,0,0,62,0,0,0,0,0,0,0,7],//推定？
		["☆3(1-1-1-1)OK",0,41,56.5,56.5,56.5,0,0,0,0,0,0,0,0],//OK
		["☆3(0-0-0-1)OK",0,123.5,22.5,22.5,22.5,0,0,0,0,0,0,0,0],//OK
		["☆3(1-1-1-0)確定",0,0,65,65,65,0,0,0,0,0,0,0,0],//確定
		["☆3(2-0-0-2)推定",0,58,16.5,159,16.5,0,0,0,0,0,0,14,0],//推定
		["☆3(0-2-0-2)確定",0,58,159,16.5,16.5,0,0,0,0,0,14,0,0],//確定
		["☆3(0-0-2-2)推定",0,58,16.5,16.5,159,0,0,0,0,0,0,0,14],//推定
		["☆4(1-1-1-1)確定",0,190,85.5,85.5,85.5,0,0,0,0,0,0,0,0],//確定
		["☆4(0-0-0-8)確定",0,241.5,61.5,61.5,61.5,0,0,0,0,0,0,0,0],//確定
		["☆4(2-2-2-2)確定",0,103,108,108,108,0,0,0,0,0,0,0,0],//確定
		["☆4(2-2-2-0)確定",0,0,139,139,139,0,0,0,0,0,0,0,0],//確定
		["☆5(1-1-1-1)確定",0,195.5,193.5,193.5,193.5,0,0,0,0,0,0,0,0],//確定
		["☆5(0-0-0-1)確定",0,442,111.5,111.5,111.5,0,0,0,0,0,0,0,0],//確定
		["☆5(6-0-0-0)確定",0,0,142,476.5,142,0,0,0,0,0,0,0,0],//確定
		["☆5(0-6-0-0)準用",0,0,476.5,142,142,0,0,0,0,0,0,0,0],//準用
		["☆5(0-0-6-0)準用",0,0,142,142,476.5,0,0,0,0,0,0,0,0],//準用
		["☆6(10-0-0-0)準用",0,0,0,0,0,0,0,192.5,690,192.5,0,120,0],//準用
		["☆6(0-10-0-0)確定",0,0,0,0,0,0,0,690,192.5,192.5,120,0,0],//確定
		["☆6(0-0-10-0)準用",0,0,0,0,0,0,0,192.5,192.5,690,0,0,120],//準用
		["☆6(0-0-0-0)確定",0,0,0,0,0,0,0,365,365,365,0,0,0],//確定
		["☆7(4-4-2-0)準用",0,0,0,0,0,0,0,817,817,405,222,222,0],//準用
		["☆7(4-2-4-0)準用",0,0,0,0,0,0,0,405,817,817,0,222,222],//準用
		["☆7(2-4-4-0)確定",0,0,0,0,0,0,0,817,405,817,222,0,222],//確定
		["☆7(0-0-0-0)確定",0,0,0,0,0,0,0,680,680,680,0,0,0],//確定
		["☆7(0-0-0-12)確定",0,0,0,0,0,0,1035,335,335,335,0,0,0],//確定
		["☆8(4-4-5-2)確定",0,0,0,0,0,0,325,740,740,1140,200,200,250],//確定
		["☆8(5-4-4-2)準用",0,0,0,0,0,0,325,740,1140,740,200,250,200],//準用
		["☆8(4-5-4-2)推定",0,0,0,0,0,0,325,1140,740,740,250,200,200],//推定
		["☆8(18-0-0-0)確定",0,0,0,0,0,0,805,1010,760,760,1115,0,0],//確定
		["☆8(0-18-0-0)確定",0,0,0,0,0,0,805,1010,760,760,0,1115,0],//確定
		["☆8(0-0-18-0)確定",0,0,0,0,0,0,805,1010,760,760,0,0,1115],//確定
		["☆8(0-0-0-15)確定",0,0,0,0,0,0,1655,630,630,630,165,165,165],//確定
		["☆8(0-0-0-0)確定",0,0,0,0,0,0,945,945,945,945,280,280,280],//確定
		["☆9(7-0-0-4)確定",0,0,0,0,0,0,2300,480,3450,480,0,1950,0],//確定
		["☆9(0-7-0-4)推定",0,0,0,0,0,0,2300,3450,480,480,1950,0,0],//推定
		["☆9(0-0-7-4)推定",0,0,0,0,0,0,2300,480,480,3450,0,0,1950],//推定
		["☆9(0-0-0-0)確定",0,0,0,0,0,0,850,2650,2650,2650,650,650,650],//確定
		["☆9(2-2-2-2)確定",0,0,0,0,0,0,2750,2750,2750,2750,175,0,0],//確定
		["☆9(3-3-3-3)確定",0,0,0,0,0,0,1800,1800,1800,1800,700,700,700],//確定
		["☆9(4-4-4-7)確定",0,0,0,0,0,0,2650,2050,2050,2050,905,905,905]//確定
		["☆0(3-3-3-3)"+PLAYER_HOLDER]
	]}, {"type":"不明","data":null}
];




//　兵科に対する各ユニットの防御値
var def = {
	//:    [剣,盾,槍,弓,騎,大剣,重盾,矛,弩,近衛,斧,双,錘],
	"ken": [15, 24,50,52,54,85, 60,140,145,151,139,147,150],//剣兵防御
	"yari":[10,108,40,58,28,56,270,100,145, 70, 54,105, 58],//槍兵防御
	"yumi":[10,104,25,42,60,56,260, 63,105,150, 52,102, 55],//弓兵防御
	"ki":  [10,112,55,26,44,56,280,137, 65,110, 50,100, 53] //騎兵防御
};

//　各ユニットの攻撃力
var atk = {
	"ken":15,
	"tate":5,
	"yari":40,
	"yumi":42,
	"ki":44,
	"dai":85,
	"jt":10,
	"hoko":100,
	"do":105,
	"kono":110,
	"ono":142,
	"sou":105,
	"sui":185
};

(function(){
	// サーバー種別を取得 : y17
	var server = HOST.substr(0, HOST.indexOf("."));

//	// サーバー種別から期を取得
//	var session = server_session[server]; // y17 -> 10
//
//	// 期からマップリストを取得
//	var maptype;
//	for (var key in maptype_session) {
//		var pos = maptype_session[key].indexOf(session);
//		if (pos !== undefined && pos >= 0) {
//			maptype = key;
//			break;
//		}
//	}

	// サーバー種別からマップリストを取得
	var maptype = server_maptype[server];

	// タイル情報を選択
	var point;
	for (var i = 0; i < point_list.length; ++i) {
		var item = point_list[i];
		if (item.type == maptype) {
			point = item.data;
			break;
		}
	}
	com_rack = nazeka + "【Map " + maptype + "】" + nazeka;

	//　出兵拠点座標の取得
	q$('.gnavi02 > a').attr("href").match(/^.*x=(-?[0-9]+).*y=(-?[0-9]+)/);
	var bcordx = RegExp.$1;
	var bcordy = RegExp.$2;

	//　出兵先座標の取得
	q$('.dispatch').attr("href").match(/^.*x=(-?[0-9]+).*y=(-?[0-9]+)/);
	tocordx = RegExp.$1;
	tocordy = RegExp.$2;

	//　距離の計算
	kyori = Math.sqrt((bcordx-tocordx)*(bcordx-tocordx)+(bcordy-tocordy)*(bcordy-tocordy));

	//　出兵先タイルパターン取得のためのHTTP要求　starに★数、tile[]に各タイル数を格納。

	q$.get(`http://${HOST}/land.php?x=${tocordx}&y=${tocordy}`, function(x){
		//　読み込み後の処理は関数 getFieldType() 内で行う。
		getFieldType(x.responseText, point);
	});
})();


//　タイルパターンの取得 及び 兵力計算・表示用関数
function getFieldType(x, point){

	//　ページ内のタイル数をカウントするための変数 初期化
	var panel = {
		"平地":0,
		"森林":0,
		"岩山":0,
		"鉄鉱山":0,
		"穀物":0,
		"荒地":0
	};

	//　GM_xmlhttpRequestの取得データをxml形式に変換
	var responseXML = document.createElement('div');
		responseXML.innerHTML = x;

	//　ソース中のタイルの行からtitleの文字列を取得
	//　1行ずつ対応するタイルの変数を加算していく
	q$('#mapOverlayMap > area[title]').each(function() {
	  panel[q$(this).attr('title')]++;
	});

	var star = q$('#soldier_unit_newattr > div.floatInner').text().replace(/\s+|(戦力)/g,"").length;

	//　タイル数→キー（"1-1-1-2"など）の作成
	var key = `☆${star}(` + [String(panel["森林"]),String(panel["岩山"]),String(panel["鉄鉱山"]),String(panel["穀物"])].join("-")+')';

	//　兵力パラメータの取得
	var list = point.filter(function(element){
		return element[0].indexOf(key) === 0;
	})[0];

	//表示距離
	var mal_length = Math.floor(kyori*100+0.5)/100;

	//表示URL
	var mal_url = `http://${HOST}/land.php?x=${tocordx}&y=${tocordy}`;
	var map_url = `http://${HOST}/map.php?x=${tocordx}&y=${tocordy}`;

	//表示部分Non
	var msg = "";

	if(list===undefined || list.length === 0){
		//　キーに対応するデータが見つからない場合。ex.NPC拠点、データがないもの
		msg += "<table class='sideBox'>\n";
		msg += spacing();
		msg += "<tr><td align=left>出兵元から、" + mal_length + "の距離にある 目的地<a href=" + mal_url + ">(" + tocordx +"," + tocordy + ")</a>　<a href=" + map_url + ">MAP</a>について、有効なデータはありません。<br>※未知のMAPであるか、ツールがこのMAPに対応していない可能性が有ります。</td></tr>\n";
		msg += "<tr><td align=left>" + se_rack + "<br>\n";
		msg += "</td></tr></table>\n";

	}else{
		//MAX計算用
		var b = calc(list, kyori);

		//表示部分
		msg += "<table style='margin: 15px 0; border:none; width:100%; background:#333'><tbody>\n\n";

		var header_content = com_rack + "<br>\n"
			+ "地形：" + String(list[0]) +"<br>\n"
			+ "距離：" + mal_length + "<br>\n"
			+ textlink("(" + tocordx +"," + tocordy + ")", mal_url) + "&nbsp;"
			+ "[" + textlink("MAP", map_url) + "]<br>\n";
		msg += spacing();
		msg += tableblock(header_content);

		msg += spacing();
		msg += compile('【対剣兵科】', b.ken);
		msg += compile('【対槍兵科】', b.yari);
		msg += compile('【対弓兵科】', b.yumi);
		msg += compile('【対騎兵科】', b.uma);
		msg += compile('【対斧兵科】', b.ono);
		msg += compile('【対双兵科】', b.sou);
		msg += compile('【対錘兵科】', b.sui);

		msg += spacing();
		msg += compile('【期待撃破スコア】', b.score);

		msg += spacing();
		msg += tableblock(se_rack);

		msg += "</tbody></table>\n";
	}

	var insertHtml = "<tr><td>" + msg + "</td></tr>";

	var insertElem = document.createElement('div');
		insertElem.innerHTML = insertHtml;
		insertElem = insertElem.firstChild;

	var containerElem = document.evaluate('//*[@class=\"sideBoxInner basename\"]', document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		containerElem.snapshotItem(0).appendChild(insertElem);
}
function calc(list, kyori) {
	//兵数計算
	var eneken	 = list[ 1] * (1+(kyori*0.1));
	var enetate  = list[ 2] * (1+(kyori*0.1));
	var eneyari  = list[ 3] * (1+(kyori*0.1));
	var eneyumi  = list[ 4] * (1+(kyori*0.1));
	var eneki	 = list[ 5] * (1+(kyori*0.1));
	var enedai	 = list[ 6] * (1+(kyori*0.1));
	var enejt	 = list[ 7] * (1+(kyori*0.1));
	var enehoko  = list[ 8] * (1+(kyori*0.1));
	var enedo	 = list[ 9] * (1+(kyori*0.1));
	var enekonoe = list[10] * (1+(kyori*0.1));
	var enepu	 = list[11] * (1+(kyori*0.1));
	var enesou	 = list[12] * (1+(kyori*0.1));
	var enesui	 = list[13] * (1+(kyori*0.1));

	// 防御力[兵種][防御力]
	var garde = [[15,10,10,10,7,9,6],	// 剣兵 1	～(剣）
		[24,108,104,112,16,20,13],	// 盾兵 2	～(剣）
		[50,40,25,55,18,23,15],	// 槍兵 3	～(槍）
		[52,58,42,26,22,26,18],	// 弓兵 4	～(弓）
		[54,28,60,44,24,28,20],	// 騎兵 5	～(騎）
		[85,56,56,56,43,50,37],	// 大剣兵 6	～(剣）
		[60,270,260,280,48,56,40],	// 重盾兵 7	～(剣）
		[140,100,63,137,51,60,42],	// 矛兵 8	～(槍）
		[145,145,105,65,54,65,46],	// 弩兵 9	～(弓）
		[151,70,150,110,59,70,52],	// 近衛騎兵 10	～(騎）
		[139,54,52,50,142,155,105],	// 戦斧兵 11	～(斧）
		[147,105,102,100,81,105,298],	// 双剣兵 12	～(双）
		[150,58,55,53,200,70,185]];	// 大錘兵 13	～(錘）

	// 合計[対兵種][最大防御力,最小防御力]
	var sum = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];

	for (var j = 0; j < 7; j++){
		// 最大防御力
		sum[j][0] += garde[0][j] * Math.floor(eneken*3);
		sum[j][0] += garde[1][j] * Math.floor(enetate*3);
		sum[j][0] += garde[2][j] * Math.floor(eneyari*3);
		sum[j][0] += garde[3][j] * Math.floor(eneyumi*3);
		sum[j][0] += garde[4][j] * Math.floor(eneki*3);
		sum[j][0] += garde[5][j] * Math.floor(enedai*3);
		sum[j][0] += garde[6][j] * Math.floor(enejt*3);
		sum[j][0] += garde[7][j] * Math.floor(enehoko*3);
		sum[j][0] += garde[8][j] * Math.floor(enedo*3);
		sum[j][0] += garde[9][j] * Math.floor(enekonoe*3);
		sum[j][0] += garde[10][j] * Math.floor(enepu*3);
		sum[j][0] += garde[11][j] * Math.floor(enesou*3);
		sum[j][0] += garde[12][j] * Math.floor(enesui*3);

		// 最小防御力
		sum[j][1] += garde[0][j] * Math.floor(eneken);
		sum[j][1] += garde[1][j] * Math.floor(enetate);
		sum[j][1] += garde[2][j] * Math.floor(eneyari);
		sum[j][1] += garde[3][j] * Math.floor(eneyumi);
		sum[j][1] += garde[4][j] * Math.floor(eneki);
		sum[j][1] += garde[5][j] * Math.floor(enedai);
		sum[j][1] += garde[6][j] * Math.floor(enejt);
		sum[j][1] += garde[7][j] * Math.floor(enehoko);
		sum[j][1] += garde[8][j] * Math.floor(enedo);
		sum[j][1] += garde[9][j] * Math.floor(enekonoe);
		sum[j][1] += garde[10][j] * Math.floor(enepu);
		sum[j][1] += garde[11][j] * Math.floor(enesou);
		sum[j][1] += garde[12][j] * Math.floor(enesui);
	}

	// スコア計算
	var minScore = Math.floor(eneken)
		+ (Math.floor(enetate) + Math.floor(eneyari) + Math.floor(eneyumi) + Math.floor(eneki)) * 2
		+ (Math.floor(enedai)) * 3
		+ (Math.floor(enejt) + Math.floor(enehoko) + Math.floor(enedo) + Math.floor(enekonoe)
		 + Math.floor(enepu) + Math.floor(enesou) + Math.floor(enesui)) * 4;

	var maxScore = Math.floor(eneken*3)
		+ (Math.floor(enetate*3) + Math.floor(eneyari*3) + Math.floor(eneyumi*3) + Math.floor(eneki*3)) * 2
		+ (Math.floor(enedai*3)) * 3
		+ (Math.floor(enejt*3) + Math.floor(enehoko*3) + Math.floor(enedo*3) + Math.floor(enekonoe*3)
		 + Math.floor(enepu*3) + Math.floor(enesou*3) + Math.floor(enesui*3)) * 4;

	// 防御計算
	return {
		ken : {max: sum[0][0], min: sum[0][1]},
		yari: {max: sum[1][0], min: sum[1][1]},
		yumi: {max: sum[2][0], min: sum[2][1]},
		uma : {max: sum[3][0], min: sum[3][1]},
		ono : {max: sum[4][0], min: sum[4][1]},
		sou : {max: sum[5][0], min: sum[5][1]},
		sui : {max: sum[6][0], min: sum[6][1]},
		score : {max: maxScore, min: minScore}
	};
}
function tableblock(content){
	return "<tr><td colspan='3' style='text-align:left'>\n" + content + "</td></tr>\n\n";
}
function spacing() {
	return "<tr><td colspan='3'>&nbsp;</td></tr>\n";
}
function textlink(title, url){
	return ""
		+ "<span"
		+ " style='color:white; text-decoration:underline;'"
		+ " onclick=\"location.href='" + url + "'\""
		+ " onmouseover=\"this.style.cursor='pointer'\""
		+ " onmouseout=\"this.style.cursor='default'\""
		+ ">" + title + "</span>";
}
function compile(title, obj) {
	var content = "";
	var max = obj.max;
	var min = obj.min;
	//SpringGreen
	if (max !== 0 && max === max) {
		content += "<tr><td style='text-align:center'>MAX</td><td style='text-align:right; font-weight:bold; color:OrangeRed'>" + max.toLocaleString() + "</td><td>　</td></tr>\n";
	}
	if (min !== 0 && min === min) {
		content += "<tr><td style='text-align:center'>MIN</td><td style='text-align:right; font-weight:bold; color:LightSkyBlue'>" + min.toLocaleString() + "</td><td>　</td></tr>\n";
	}
	if (content.length === 0) return "";
	return "<tr><td colspan='3'>" + title + "</td></tr>\n" + content + "\n";
}
// for debug print object
function po(obj, ext = "") {
	console.log(ext + JSON.stringify(obj, null, '\t'));
}
function array_merge(dest, src) {
	Array.prototype.push.apply(dest, src);
}
function array_unique(array) {
	return array.filter(function(element, index) {
		return array.indexOf(element) === index; // Chrome 系では、filter で第3引数がない
	});
}
