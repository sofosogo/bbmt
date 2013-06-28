/**
 * Opera TV API v. 2.0
 */
if( typeof window.opera == 'undefined') {
	window.opera = {}
}
window.opera.app = {
	/**
	 * closes fullscreen application and returns to TV portal
	 */
	close : function() {
		window.close();
	},
	toString : function() {
		return "Opera TV Store, TVApp API";
	}
}
window.opera.tv = new Object();

/*
 * 获取浏览器中的URL后面的参数
 */
function getRequest() {
	var url = location.search;
	var Request = new Object();
	if(url.indexOf("?") != -1) {
		var str = url.substr(1)//去掉?号
		strs = str.split("&");
		for(var i = 0; i < strs.length; i++) {
			Request[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
		}
	}
	return Request;
}
var request = getRequest();

/*=============CEB平台按键值==========*/
VK_LEFT = 37;
VK_RIGHT = 39;
VK_UP = 38;
VK_DOWN = 40;
VK_ENTER = 13;
VK_BACK_SPACE = 8;
VK_MENU = 109;
VK_0 = 48;
VK_1 = 49;
VK_2 = 50;
VK_3 = 51;
VK_4 = 52;
VK_5 = 53;
VK_6 = 54;
VK_7 = 55;
VK_8 = 56;
VK_9 = 57;
VK_BLUE = 406;
VK_RED = 403;
VK_GREEN = 404;
VK_YELLOW = 502;
VK_PLAY = null;
VK_PAUSE = null;
VK_STOP = null;
VK_TRACK_NEXT = null;
VK_TRACK_PREV = null;
VK_FAST_FWD = null;
VK_REWIND = null;
VK_SUBTITLE = null;
VK_INFO = null;
/*============TV端浏览器===================*/
/*
VK_LEFT = 37;
VK_RIGHT = 39;
VK_UP = 38;
VK_DOWN = 40;
VK_ENTER = 13;
VK_BACK_SPACE = 8;
VK_MENU = 109;
VK_0 = 48;
VK_1 = 49;
VK_2 = 50;
VK_3 = 51;
VK_4 = 52;
VK_5 = 53;
VK_6 = 54;
VK_7 = 55;
VK_8 = 56;
VK_9 = 57;
VK_BLUE = 112;
VK_RED = 113;
VK_GREEN = 114;
VK_YELLOW = 115;
VK_PLAY = null;
VK_PAUSE = null;
VK_STOP = null;
VK_TRACK_NEXT = null;
VK_TRACK_PREV = null;
VK_FAST_FWD = null;
VK_REWIND = null;
VK_SUBTITLE = null;
VK_INFO = null;
*/
/*============chrome平台按键值==============*/
/*
VK_LEFT = 37;
VK_RIGHT = 39;
VK_UP = 38;
VK_DOWN = 40;
VK_ENTER = 13;
VK_BACK_SPACE = 8;
VK_MENU = 109;
VK_0 = 48;
VK_1 = 49;
VK_2 = 50;
VK_3 = 51;
VK_4 = 52;
VK_5 = 53;
VK_6 = 54;
VK_7 = 55;
VK_8 = 56;
VK_9 = 57;
VK_BLUE = 66;
VK_RED = 82;
VK_GREEN = 71;
VK_YELLOW = 121;
VK_PLAY = null;
VK_PAUSE = null;
VK_STOP = null;
VK_TRACK_NEXT = null;
VK_TRACK_PREV = null;
VK_FAST_FWD = null;
VK_REWIND = null;
VK_SUBTITLE = null;
VK_INFO = null;
*/

/**
 * key mappings for back compatibility with previous version of the api
 */
try { VK_LEFT;
} catch(err) {
	VK_LEFT = 37;
}
window.opera.tv.VK_LEFT = VK_LEFT;
//37
try { VK_RIGHT;
} catch(err) {
	VK_RIGHT = 39;
}
window.opera.tv.VK_RIGHT = VK_RIGHT;
//39
try { VK_UP;
} catch(err) {
	VK_UP = 38;
}
window.opera.tv.VK_UP = VK_UP;
//38
try { VK_DOWN;
} catch(err) {
	VK_DOWN = 40;
}
window.opera.tv.VK_DOWN = VK_DOWN;
//40
try { VK_ENTER;
} catch(err) {
	VK_ENTER = 13;
}
window.opera.tv.VK_ENTER = VK_ENTER;
//13
try { VK_BACK_SPACE;
} catch(err) {
	VK_BACK_SPACE = 8;
}
window.opera.tv.VK_BACK_SPACE = VK_BACK_SPACE;
//8
try { VK_MENU;
} catch(err) {
	VK_MENU = 109;
}
window.opera.tv.VK_MENU = VK_MENU;
//109
try { VK_0;
} catch(err) {
	VK_0 = 48;
}
window.opera.tv.VK_0 = VK_0;
//48
try { VK_1;
} catch(err) {
	VK_1 = 49;
}
window.opera.tv.VK_1 = VK_1;
//49
try { VK_2;
} catch(err) {
	VK_2 = 50;
}
window.opera.tv.VK_2 = VK_2;
//50
try { VK_3;
} catch(err) {
	VK_3 = 51;
}
window.opera.tv.VK_3 = VK_3;
//51
try { VK_4;
} catch(err) {
	VK_4 = 52;
}
window.opera.tv.VK_4 = VK_4;
//52
try { VK_5;
} catch(err) {
	VK_5 = 53;
}
window.opera.tv.VK_5 = VK_5;
//53
try { VK_6;
} catch(err) {
	VK_6 = 54;
}
window.opera.tv.VK_6 = VK_6;
//54
try { VK_7;
} catch(err) {
	VK_7 = 55;
}
window.opera.tv.VK_7 = VK_7;
//55
try { VK_8;
} catch(err) {
	VK_8 = 56;
}
window.opera.tv.VK_8 = VK_8;
//56
try { VK_9;
} catch(err) {
	VK_9 = 57;
}
window.opera.tv.VK_9 = VK_9;
//57
try { VK_BLUE;
} catch(err) {
	VK_BLUE = 98;
}

window.opera.tv.VK_BLUE = VK_BLUE;
//98 //113
try { VK_RED;
} catch(err) {
	VK_RED = 114;
}
window.opera.tv.VK_RED = VK_RED;
//114
try { VK_GREEN;
} catch(err) {
	VK_GREEN = 103;
}
window.opera.tv.VK_GREEN = VK_GREEN;
//103
try { VK_YELLOW;
} catch(err) {
	VK_YELLOW = 121;
}
window.opera.tv.VK_YELLOW = VK_YELLOW;
//121
try { VK_PLAY;
} catch(err) {
	VK_PLAY = null;
}
window.opera.tv.VK_PLAY = VK_PLAY;
try { VK_PAUSE;
} catch(err) {
	VK_PAUSE = null;
}
window.opera.tv.VK_PAUSE = VK_PAUSE;
try { VK_STOP;
} catch(err) {
	VK_STOP = null;
}
window.opera.tv.VK_STOP = VK_STOP;
try { VK_TRACK_NEXT;
} catch(err) {
	VK_TRACK_NEXT = null;
}
window.opera.tv.VK_TRACK_NEXT = VK_TRACK_NEXT;
try { VK_TRACK_PREV;
} catch(err) {
	VK_TRACK_PREV = null;
}
window.opera.tv.VK_TRACK_PREV = VK_TRACK_PREV;
try { VK_FAST_FWD;
} catch(err) {
	VK_FAST_FWD = null;
}
window.opera.tv.VK_FAST_FWD = VK_FAST_FWD;
try { VK_REWIND;
} catch(err) {
	VK_REWIND = null;
}
window.opera.tv.VK_REWIND = VK_REWIND;
try { VK_SUBTITLE;
} catch(err) {
	VK_SUBTITLE = null;
}
window.opera.tv.VK_SUBTITLE = VK_SUBTITLE;
try { VK_INFO;
} catch(err) {
	VK_INFO = null;
}
window.opera.tv.VK_INFO = VK_INFO;

