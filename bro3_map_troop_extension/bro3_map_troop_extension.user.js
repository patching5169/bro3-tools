// ==UserScript==
// @name		bro3_map_troop_extension
// @namespace	https://gist.github.com/RAPT21/
// @description	ブラウザ三国志 マップ画面遠征ツール(51x51)
// @include 	http://*.3gokushi.jp/big_map.php*
// @include 	https://*.3gokushi.jp/big_map.php*
// @include		http://*.3gokushi.jp/facility/unit_status.php*
// @include		https://*.3gokushi.jp/facility/unit_status.php*
// @exclude		http://*.3gokushi.jp/maintenance*
// @exclude		https://*.3gokushi.jp/maintenance*
// @require		http://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @connect		3gokushi.jp
// @grant		none
// @author		RAPT
// @version 	1.5
// ==/UserScript==
jQuery.noConflict();

//==========[機能]==========
// 51x51 MAP 画面専用
// - クリック拡張モード
//	   - 資源地カラーリング
//	   - 左クリック: ここへ出兵 / 領地名を変更
//	   - 右クリック: この領地を削除
//
// - 領地名変更モードで、自拠点をクリックするとその拠点名を変更できます。
// - 領地名変更モードで、NPC砦をクリックするとNPC砦情報をコピーできます。
// ※クリック拡張モード中に拠点マスをクリックで援軍出兵もできます。
//
// 左上に追加される「クリック拡張モードにする」をクリックします。
// するとMAPが赤枠になり、資源地の色が変わります。緑＝木高領地、水＝石高領地、橙＝鉄高領地、黄＝糧高領地、赤＝拠点用地。
// この状態でマスをクリックするとそのマス目が紫色になり、出兵画面が別窓で開きます。
// マスを右クリックすると領地削除となり、そのマス目が赤くなります。
//
// ※クリック拡張モード中は通常のクリック、右クリックは動作しません。
// 左上に追加される「<-- 通常マップに戻す」をクリックすると元の画面に戻ります。
//

// 2017.05.05	0.2
// 2017.05.15	0.3
// 2017.05.16	0.4
// 2017.06.24	1.0	初版公開
// 2017.07.13	1.1	新MAP画面対応
// 2017.08.14	1.2	12期～のカラーリング追加、出兵後の兵士管理画面が「全て表示」に自動的に切り替わるようにした
// 2018.07.02	1.3	10期～のカラーリング追加、★4～6 の領地もカラーリングするかのオプション(デフォルトfalse)を追加
// 2020.06.07	1.4	https対応、NPC領地もカラーリング対象、未取得領地をカラーリングするかのオプション(デフォルトfalse)を追加
// 2020.07.12	1.5	未攻略のNPC拠点名が取得できなくなっていた不具合を修正

//==========[オプション]==========
var OPT_COLORING_RESOURCES = true;		// 資源地カラーリングを行うか。falseだと何も行いません。
var OPT_TROOP_OPEN_NEW_WINDOW = true;	// 出兵画面を新規ウィンドウで開くか。falseだと同一画面で遷移します。
var OPT_REFRESH_AFTER_EDITNAME = false;	// 領地名変更後に画面更新するか。falseだと処理成功時マス目が点滅します。
var OPT_UNIT_STATUS_SWITCH_SORTIE_TO_ALL = false;	// 出兵管理画面で出撃タブ表示時、全て表示に切り替える
var OPT_SUPPORT_MIDDLE_RANGE_LAND = false;	// ★4～6 の領地もカラーリングするか
var OPT_COLORING_VIRGIN = false;		// 未取得領地をカラーリングするか

//==========[本体]==========
(function($) {

	// 広告iframe内で呼び出された場合は無視
	if (!$("#container").length) {
		return;
	}

	// 歴史書モードの場合は無視
	if ($("#sidebar img[title=歴史書]").length){
		return;
	}

	//------------------------
	// 準備
	//------------------------
	var isOldMap = $("#change-map-scale ul").length > 0;
	if (isOldMap) {
		$("#mapAll").css({'height':'1160px'});
	}

	// iframeの高さは動的に変えられないので、更新をiframeに通知する
	$('iframe').on(
		'load', function(){
			try {
				$(this).height(this.contentWindow.document.documentElement.scrollHeight);
			} catch (e) {
		}
	});
	$('iframe').trigger('load');

	//------------------------
	// メイン
	//------------------------

	// 兵士管理画面: 出撃タブを自動的に全て表示に切り替える
	if (OPT_UNIT_STATUS_SWITCH_SORTIE_TO_ALL) {
		if (location.href.indexOf("/facility/unit_status.php?type=sortie") >= 0) {
			setTimeout(function(){
		  		location.href = "/facility/unit_status.php?type=all";
			}, 200);
			return;
		}
	}

	// 51x51マップ画面以外はなにもしない
	if (!location.href.match(/big_map.php/)) {
		return;
	}

	// 選択されているマップサイズチェック
	var viewSize = -1;
	var mapSelect;
	if (isOldMap) {
		mapSelect = $("div[id=change-map-scale] li[class*=now]");
	} else {
		mapSelect = $("div[id=change-map-scale2] a[class*=now]");
	}

	mapSelect.each(
		function(){
			if ($(this).attr("class").match(/sort(\d+) now/)){
				viewSize = RegExp.$1;
			}
		}
	);
	if (viewSize != 51) {
		return;
	}

	// マップデータ保持用
	var mapdata = [];

	//------------------------
	// モード切替ボタンの配置
	//------------------------
	var parentElement;
	var marginStyle;
	if (isOldMap) {
		$("#change-map-scale ul").css({'width' : '350px'});
		parentElement = $("#change-map-scale");
		marginStyle = "margin-top:76px;";
	} else {
		parentElement = $("#enemyView2");
		marginStyle = "margin-top:58px; margin-left:110px;";
	}
	parentElement.after(
		"<div style='" + marginStyle + " width:45%;'>" +
 			"<input type='button' id='enter_custom' style='margin-left:20px;' value='クリック拡張モードにする'></input>" +
			"<input type='button' id='exit_custom' style='display:none; margin-left:20px;' value='&lt;--　通常マップに戻す　'></input>" +
		"</div>"
	);
	$("#map51-navi").after(
		"<div style='float:left; position:absolute; margin-left:418px; width:45%; color:blue; font-weight:bold;'>&nbsp;&nbsp;" +
			"<label id='mode_troop'  style='display:none;'><input type='radio' name='leftclickmode' value='troop' checked='checked'>左クリックで出兵</input>&nbsp;</label>&nbsp;&nbsp;" +
			"<label id='mode_rename' style='display:none;'><input type='radio' name='leftclickmode' value='rename'>左クリックで領地名編集</input>&nbsp;</label>&nbsp;&nbsp;" +
		"</div>" +
		"<div id='custom_description' style='display:none; color:blue; font-weight:bold; float:left; position:absolute; font-size:13px; left:18px; margin-top:20px; margin-left:420px;'>右クリックで領地破棄</div>"
	);

	//--------------------
	// マップ解析
	//--------------------
	function add_to_mapdata(element) {
		var obj = {};
		obj.map = element;

		$(element).attr('href').match(/x=([-]*\d+).*y=([-]*\d+)#ptop/);
		var x = RegExp.$1;
		var y = RegExp.$2;
		obj.x = x;
		obj.y = y;
		obj.blank = false;
		obj.virgin = false;
		obj.npc = false;
		obj.areaname = "";
		obj.wood = 0;
		obj.stone = 0;
		obj.iron = 0;
		obj.food = 0;
		var mtext = $(element).attr('onmouseover');
		if (mtext.match(/空き地/)) {
			obj.blank = true;
			if (mtext.match(/空き地\(未取得\)/)) {
				obj.virgin = true;
			}
		}
		if (mtext.match(/<dt>君主名<\/dt><dd>NPC<\/dd>/)) {
			obj.npc = true;
			if (mtext.match(/新領地\d+,\d+\(未取得\)/)) {
				obj.virgin = true;
			}
		}
		if (mtext.match(/bigmap-caption[^>]*>([^<]+)/)) {
			obj.areaname = RegExp.$1;
		}
		if (mtext.match(/戦力.*>([★]+)<.*木(\d+).*岩(\d+).*鉄(\d+).*糧(\d+)/)) {
			obj.stars = RegExp.$1.length;
			obj.wood = parseInt(RegExp.$2, 10);
			obj.stone = parseInt(RegExp.$3, 10);
			obj.iron = parseInt(RegExp.$4, 10);
			obj.food = parseInt(RegExp.$5, 10);

			// 資源地カラーリング適用
			draw_resources(obj, $(element));
		}
		if (mtext.match(/戦力<.*npc-red-star.*>([★]+)</)) {
			obj.npcname = obj.areaname + "(" + x + "," + y + ") ★" + RegExp.$1.length;
		}

		// マップデータを蓄積
		var keyx = "x" + x;
		var keyy = "y" + y;
		if (typeof mapdata[keyx] == 'undefined') {
			mapdata[keyx] = [];
		}
		mapdata[keyx][keyy] = obj;
	}

	//-------------------
	// 通常マップに戻る
	//-------------------
	$("#exit_custom").click(
		function() {
			$("#enter_custom").css({'display':''});
			$("#exit_custom").css({'display':'none'});
			$("#mode_troop").css({'display':'none'});
			$("#mode_rename").css({'display':'none'});
			$("#map51-content").css({'border':''});
			$("#custom_description").css({'display':'none'});

			//-------------------------------------------------
			// マップを元に戻す
			//-------------------------------------------------
			for (var keyx in mapdata) {
				for (var keyy in mapdata[keyx]) {
					var at = $(mapdata[keyx][keyy].map);
					at.css({'background-color':''});
					at.css({'color':'black'});
					at.css({"text-decoration":""});
					at.css({'text-shadow':''});
					at.off('click');
					at.off('contextmenu');
					var url = '/land.php?x=' + mapdata[keyx][keyy].x + '&y=' + mapdata[keyx][keyy].y + '#ptop';
					at.attr('href', url);
				}
			}
		}
	);

	//-------------------
	// カスタムモード
	//-------------------
	$("#enter_custom").click(
		function() {
			$("#enter_custom").css({'display':'none'});
			$("#exit_custom").css({'display':''});
			$("#mode_troop").css({'display':''});
			$("#mode_rename").css({'display':''});
			$("#custom_description").css({'display':''});
			$("#map51-content").css({'border':'3px solid red'});
			var map = $("#map51-content a[href*='/land.php']");

			//-----------------------
			// マップデータ収集処理
			//-----------------------
			for (var i = 0; i < map.length; i++) {
				add_to_mapdata(map[i]);

				// 運営の左クリックジャンプを潰す
				$(map[i]).attr('href', '#');

				//---------------------------------
				// マップを左クリックした時の動作
				//---------------------------------
				$(map[i]).on('click',
					function(event){

						//---------------------------------
						// クリックされたマップ座標の取得
						//---------------------------------
						var at = $(this);
						at.attr('onmouseover').match(/距離<.*\(([-]*\d+),([-]*\d+)\)/);
						var mx = RegExp.$1;
						var my = RegExp.$2;

						//---------------------------------
						// 処理
						//---------------------------------
						if ($('input[name=leftclickmode]:eq(0)').is(':checked')) {
							actionTroop(at, mx, my);
						} else {
							actionEditName(at, mx, my);
						}

						return false;
					}
				);

				//---------------------------------
				// マップを右クリックした時の動作
				//---------------------------------
				$(map[i]).on('contextmenu',
					function(){

						//---------------------------------
						// クリックされたマップ座標の取得
						//---------------------------------
						var at = $(this);
						at.attr('onmouseover').match(/距離<.*\(([-]*\d+),([-]*\d+)\)/);
						var mx = RegExp.$1;
						var my = RegExp.$2;

						//---------------------------------
						// 処理
						//---------------------------------
						actionRemoveTerritory(at, mx, my);

						return false;
					}
				);
			}
		}
	);

	//-------------------
	// 出兵モード
	//-------------------
	function actionTroop(at, mx, my) {
		//	背景色を変更してから出兵画面を開く
		at.css({"background-color":"purple"});

		var url = "/facility/castle_send_troop.php?x=" + mx + "&y=" + my;
		if (OPT_TROOP_OPEN_NEW_WINDOW) {
			window.open(url,
				'bro3_map_extension_troop',
				'menubar=yes,resizable=yes,toolbar=yes,location=no,status=yes,scrollbars=yes');
		} else {
			location.href = url;
		}
	}

	//-------------------
	// 領地名編集モード
	//-------------------
	function actionEditName(at, mx, my) {
		var keyx = "x" + mx;
		var keyy = "y" + my;
		var obj = mapdata[keyx][keyy];
		if (obj.npcname) {
			prompt("NPC砦情報（ここの名称は変更されません）", obj.npcname);
			return;
		}

		var mxy = mx + "," + my;
		var message_pre = "新しい領地名を入力してください。";
		var message = "\n(" + mxy + ")";
		if (obj.stars) {
			message += " ★" + obj.stars + "(" + obj.wood + "-" + obj.stone + "-" + obj.iron + "-" + obj.food + ")";
			if (obj.wood > 0 && obj.stone === 0 && obj.iron === 0 && obj.food === 0) {
				message += "\n★" + obj.stars + "木" + mxy;
			} else if (obj.wood === 0 && obj.stone > 0 && obj.iron === 0 && obj.food === 0) {
				message += "\n★" + obj.stars + "石" + mxy;
			} else if (obj.wood === 0 && obj.stone === 0 && obj.iron > 0 && obj.food === 0) {
				message += "\n★" + obj.stars + "鉄" + mxy;
			} else if (obj.wood === 0 && obj.stone === 0 && obj.iron === 0 && obj.food > 0) {
				message += "\n★" + obj.stars + "糧" + mxy;
			} else if (obj.wood === 4 && obj.stone === 4 && obj.iron === 4 && obj.food >= 4) {
				message += "\n★" + obj.stars + "資" + mxy;
			} else if (obj.wood === 1 && obj.stone === 1 && obj.iron === 1 && obj.food === 2) {
				message += "\n★" + obj.stars + "拠" + mxy;
			} else if (obj.wood === 0 && obj.stone === 0 && obj.iron === 0 && obj.food === 0) {
				message += "\n★" + obj.stars + "拠" + mxy;
			}
		} else {
			message_pre = message_pre.replace(/領地名/,"拠点名");
		}

		if (obj.npc) {
			prompt("NPC領地情報（ここの名称は変更されません）" + message, obj.areaname);
			return;
		}

		var newname = $.trim(prompt(message_pre + message, obj.areaname));
		if (newname && newname.length && obj.areaname !== newname) {
			// 領地名が変更されていた場合、変更処理を実行
			editname(obj, newname);
		}
	}

	//--------------------------------------------------
	// 領地破棄を実施後、その領地マスの色を変える
	//--------------------------------------------------
	function actionRemoveTerritory(at, mx, my) {
		var wait = false;
		var timer1 = setInterval(
			function() {
				if (wait) {
					return;
				}
				wait = true;

				$.ajax({
					url: location.origin + "/territory_proc.php",
					type: 'GET',
					datatype: 'html',
					cache: false,
					data: {'x': mx, 'y': my, 'mode': 'remove'}
				})
				.done(function(res){
					clearInterval(timer1);
					timer1 = null;
					at.css({"background-color":"red"});
					at = null;
					wait = false;
				});
			}, 200
		);
	}

	//--------------------
	// 領地名変更処理
	//--------------------
	function editname(obj, new_name, handler) {
		var wait = false;
		var timer1 = setInterval(
			function() {
				if (wait) {
					return;
				}
				wait = true;

				var keyx = "x" + obj.x;
				var keyy = "y" + obj.y;
				$.ajax({
					url: location.origin + '/land.php',
					type: 'GET',
					datatype: 'html',
					cache: false,
					data: {'x': obj.x, 'y': obj.y},
					success: function(res){
						var village_id = $("#basepointEditName #name [name=village_id]", res).val();
						if (typeof village_id == 'undefined') {
							alert("指定された領地(" + obj.x + "," + obj.y + ")の名前は変更できません。");
							return;
						}

						$.ajax({
							type: "POST",
							url: "/user/change_territory_name.php",
							datatype: "json",
							cache: false,
							data: {new_name: new_name, village_id: village_id},
							success: function(i){
								if (i.status === "OK") {
									if (OPT_REFRESH_AFTER_EDITNAME) {
										location.reload();
									} else {
										// キャッシュデータのみ更新
										mapdata[keyx][keyy].areaname = new_name;
										flush_bgcolor($(obj.map));
									}
								} else {
									alert(i.message);
								}
							}
						});
					}
				})
				.done(function(res){
					clearInterval(timer1);
					timer1 = null;
					wait = false;
				});
			}, 200
		);
	}

	//--------------------
	// マス背景を点滅
	//--------------------
	function flush_bgcolor(at) {
		var colors = [
			"white","cyan",
			"white","cyan",
			"white","cyan",
			""]; // 最後は番兵を兼ねる。背景色を規定に戻し、ループ終端をマーク。
		var index = 0;
		var timer1 = setInterval(
			function() {
				at.css({"background-color": colors[index]});

				if (colors[index].length === 0) {
					clearInterval(timer1);
					timer1 = null;
				}
				index += 1;
			}, 150
		);
	}

	//--------------------
	// 資源地カラーリング
	//--------------------
	function draw_resources(obj, at) {

		if (!OPT_COLORING_RESOURCES) {
			return;
		}

		// 空き地以外は無視
		if (!obj.blank && !obj.npc) {
			return;
		}

		var border = "none";
		if (OPT_COLORING_VIRGIN && obj.virgin) {
			border = "1px solid green";
		}

		const cWood = "springgreen";
		const cStone = "aqua";
		const cIron = "orange";
		const cRice = "yellow";
		const cFacility = "red";
		const cResource = "fuchsia";
		const cRiceField = "snow";
		const cMultiField = "red";
		let col = "";

		if (OPT_SUPPORT_MIDDLE_RANGE_LAND && obj.stars >= 4) {
			// ★4～6 をサポート
			if (obj.stars === 4 && obj.wood === 1 && obj.stone === 1 && obj.iron === 1 && obj.food === 1) { // ★4:平地26
				// ★4(1-1-1-1) は3種資源施設各2＋水車＋倉庫12＋雀村に最適
				col = cMultiField;
			} else if (obj.stars === 5 || obj.stars === 6) {
				// (6-0) 系、(10-0) 系、(0-1) 系、ALL-0 をまとめてカラーリング。
				if (obj.wood !== 0 && obj.stone === 0 && obj.iron === 0 && obj.food === 0) {
					col = cWood;
				} else if (obj.wood === 0 && obj.stone !== 0 && obj.iron === 0 && obj.food === 0) {
					col = cStone;
				} else if (obj.wood === 0 && obj.stone === 0 && obj.iron !== 0 && obj.food === 0) {
					col = cIron;
				} else if (obj.wood === 0 && obj.stone === 0 && obj.iron === 0 && obj.food !== 0) {
					if (obj.food === 1) {	// ★5:平地28
						col = cRiceField;
					} else {
						col = cRice;
					}
			//	} else if (obj.wood === 0 && obj.stone === 0 && obj.iron === 0 && obj.food === 0) { // ★6:平地27
			//		col = cFacility;
				}
			}
		} else if (obj.stars < 7) {
			// ★7未満は無視
			at.css({"border": border});
			return;
		}

		if (obj.wood >= 14 && obj.stone === 0 && obj.iron === 0 && obj.food === 0) {
			col = cWood;
		} else if (obj.wood === 0 && obj.stone >= 14 && obj.iron === 0 && obj.food === 0) {
			col = cStone;
		} else if (obj.wood === 0 && obj.stone === 0 && obj.iron >= 14 && obj.food === 0) {
			col = cIron;
		} else if (obj.wood === 0 && obj.stone === 0 && obj.iron === 0 && obj.food >= 12) {
			col = cRice;
		} else if (obj.wood === 0 && obj.stone === 0 && obj.iron === 0 && obj.food === 1) { // ★7:平地32
			col = cRiceField;
		} else if (obj.stars === 8) {	// ★8特化
			if (obj.wood >= 5 && obj.stone === 4 && obj.iron === 4 && obj.food === 2) { // 12期～
				col = cWood;
			} else if (obj.wood === 4 && obj.stone >= 5 && obj.iron === 4 && obj.food === 2) { // 12期～
				col = cStone;
			} else if (obj.wood === 4 && obj.stone === 4 && obj.iron >= 5 && obj.food === 2) { // 12期～
				col = cIron;
			} else if (obj.wood === 0 && obj.stone === 0 && obj.iron === 0 && obj.food === 0) { // 10期～:平地37
				col = cFacility;
			}
		} else if (obj.stars === 9) {	// ★9特化
			if (obj.wood === 1 && obj.stone === 1 && obj.iron === 1 && obj.food === 2) { // 2～11期:平地39
				col = cFacility;
			} else if (obj.wood === 3 && obj.stone === 3 && obj.iron === 3 && obj.food === 3) { // (3-3-3-3) 資源地
				col = cResource;
			} else if (obj.wood === 4 && obj.stone === 4 && obj.iron === 4 && obj.food === 4) { // (4-4-4-4) 資源地
				col = cResource;
			} else if (obj.wood === 0 && obj.stone === 0 && obj.iron === 0 && obj.food === 0) { // 12期～:平地40
				col = cFacility;
			} else if (obj.wood === 7 && obj.stone === 0 && obj.iron === 0 && obj.food === 4) { // 12期～:平地37,工場村
				col = cWood;
			} else if (obj.wood === 0 && obj.stone >= 7 && obj.iron === 0 && obj.food === 4) { // 12期～:平地37,工場村
				col = cStone;
			} else if (obj.wood === 0 && obj.stone === 0 && obj.iron >= 7 && obj.food === 4) { // 12期～:平地37,工場村
				col = cIron;
			}
		}
		if (col.length) {
			// 数字をカラーリングし、黒い縁取りをつけて見やすくする
			at.css({"color": col, "text-shadow": "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000", "border": border});
		} else {
			at.css({"border": border});
		}
	}

})(jQuery);
