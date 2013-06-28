//定义全局变量
var constant = {
	PERSISTENT_INFO : "BM_Device_Info",
	INTRO_MODEL : "intro_model",
	HELP_MODEL : "help_model",
	CONNECTING_MODEL : "connecting_mode",
	MANUAL_CONNECT_MODEL : "manual_connect_mode",
	MONITOR_MODEL : "monitor_view",
	PIC_IN_PIC : "pic_in_pic"
};
//判断是否是第一次进入
var isFirst = true;

//抓取持久对象
var oPersistentInfo = null;

/*
 * 保存连接信息
 */
function saveValue() {
	setCookie(constant.PERSISTENT_INFO, JSON.stringify(oPersistentInfo), 1000);
}

/*
 * 获得连接信息
 */
function getCookieValue() {
	var localValue = getCookie(constant.PERSISTENT_INFO);
	if(localValue)
		oPersistentInfo = JSON.parse(localValue);
}

/*
 * @param searchName cookie相应值的name
 * @return searchName对应的value
 */
function getCookie(searchName) {
	var cookie_star = document.cookie.indexOf(searchName);
	var cookie_end = document.cookie.indexOf(";", cookie_star);
	return cookie_star == -1 ? '' : unescape(document.cookie.substring(cookie_star + searchName.length + 1, (cookie_end > cookie_star ? cookie_end : document.cookie.length)));
}

/*
 * @param cookieName cookie相应值的name
 * @param cookieValue 对应的value
 * @param days cookie保存的天数
 * @param path cookie保存的path路径
 * @param domain cookie保存的域名
 * @param secure 是否启用安全方法
 * @return searchName对应的value
 */
function setCookie(cookieName, cookieValue, days, path, domain, secure) {
	var expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 3600 * 1000);
	document.cookie = escape(cookieName) + '=' + escape(cookieValue) + ( expires ? '; expires=' + expires.toGMTString() : '') + ( path ? '; path=' + path : '/') + ( domain ? '; domain=' + domain : '') + ( secure ? '; secure' : '');
}

/*
 * @param searchName 要删除的cookie name
 */
function delCookie(searchName) {
	var expires = new Date(0);
	var cval = getCookie(searchName);
	document.cookie = searchName + "=" + cval + "; expires=" + expires.toGMTString();
}

getCookieValue();

/*
 * 用来保存获取到手机信息的对象
 */
var curDevice = {
	url : "",
	name : "婴视宝",
	width : 288,
	height : 352,
	battery : 99,
	decibel : 0,
	alertDecibel : 99,
	isLandscape : false,
	port : 8080,
	iscaller : false
}
var lDecibel = 0;          //当前分贝
var isChanging = false;   //分贝条提醒值是否正在改变
var currentType = 0;      //当前横竖屏类型
var curDirectJPG = 'shot_v.jpg';  //当前需要请求的横竖屏图片
var srcWidth = 288;       //获取图片的宽度
var srcHeight = 352;      //获取图片的高度
var mobileConnect = false; //判断是否手机端连接电视
var canEnter = true;
var small = false;
var isMonitor = false;
var titleChanged = false;
var isPicInPic = false;
var isInterrupt = false;
/*
 * 关闭浏览器
 */
function fnCloseWindow() {
	window.close();
}

/*
 * 产生随机数
 */
var curDate = {
	getCurDate : function() {
		var d = new Date();
		var strDate = d.getFullYear() + "" + d.getMonth() + "" + d.getDate() + "" + d.getDay() + "" + d.getHours() + "" + d.getMinutes() + "" + d.getSeconds();
		return Math.random() + "a" + strDate;
	}
}

/*
 * 封装querySelector方法
 */
function $(q) {
	return document.querySelector(q);
}

function $$(q) {
	return document.querySelectorAll(q);
}

/**
 *定义缩放的数据结构
 */
var scale = {
	width : null,
	height : null
};

/**
 *@see cn.hkm.web.Picture.java
 *在指定宽度和高度范围内最大化缩放图片
 *@param width  图片原始宽度
 *@param height 图片原始高度
 *@param outWidth  指定宽度范围
 *@param outHeight 指定宽度范围
 */

var scaleWH = function(width, height, outWidth, outHeight) {
	width = parseInt(width);
	height = parseInt(height);
	outWidth = parseInt(outWidth);
	outHeight = parseInt(outHeight);

	var h = width;
	var w = height;
	var r = height / width;
	var rs = outHeight / outWidth;
	if((width <= outWidth) && (height <= outHeight)) {
		if(r > rs) {
			w = outWidth;
			h = parseInt(outWidth * r);
		}
		if(r < rs) {
			h = outHeight;
			w = parseInt(outHeight / r);
		}
		if(r == rs) {
			w = outWidth;
			h = outHeight;
		}
	}
	if((width <= outWidth) && (height > outHeight)) {
		w = parseInt(outHeight / r);
		h = outHeight;
	}
	if((width > outWidth) && (height <= outHeight)) {
		w = outWidth;
		h = parseInt(outWidth * r);
	}
	if((width > outWidth) && (height > outHeight)) {
		if(r < rs) {
			w = outWidth;
			h = parseInt(outWidth * r);
		}
		if(r > rs) {
			h = outHeight;
			w = parseInt(outHeight / r);
		}
		if(r == rs) {
			w = outWidth;
			h = outHeight;
		}
	}
	scale.width = w;
	scale.height = h;
	return scale;
}
/**
 * 解析手机端的info.js
 */
function parseTelXml(data, model) {
	if(!data && data.Width == 0 && data.Height == 0) {
		return false;
	}
	var decibelValue = data.Decibel;
	var alertDecibelValue = data.AlarmDecibel;
	var heightValue = data.Height;
	var widthValue = data.Width;
	curDevice.battery = data.BatteryPercent;
	curDevice.name = data.DeviceName;
	curDevice.url = data.DeviceIp;
	curDevice.iscaller = data.iscaller;
	srcWidth = widthValue;
	srcHeight = heightValue;
	curDevice.isLandscape = widthValue > heightValue;
	if(srcWidth <= srcHeight && currentType != 1) {
		changeDirect(1, decibelAndBatteryObj.model, srcWidth, srcHeight);
	} else if(srcWidth > srcHeight && currentType != 2) {
		changeDirect(2, decibelAndBatteryObj.model, srcWidth, srcHeight);
	}
	var radio = widthValue / heightValue;
	if(model == constant.MONITOR_MODEL) {
		curDevice.decibel = Math.ceil(decibelValue);
		curDevice.alertDecibel = Math.ceil(alertDecibelValue);
	} else if(model == constant.PIC_IN_PIC) {
		curDevice.decibel = decibelValue;
		curDevice.alertDecibel = alertDecibelValue;
	}
	return true;
};

/**
 * 横竖屏切换时对Canvas，分贝条等进行操作
 */
function changeDirect(type, mode, width, height) {
	if(small) return;
	currentType = type;
	var contentWidth = $("#monitorImgContent").clientWidth;
	var contentHeight = $("#monitorImgContent").clientHeight;
	//操作双画面相应的canvas,分贝条
	if(mode == constant.MONITOR_MODEL) {
		if(type == 1) {
			var wrapHeight = contentHeight;
			var wrapWidth = scaleWidth(height, wrapHeight, width);
			curDirectJPG = "shot_v.jpg";
			$('#monitorWrap').style.maxWidth = '70%';
		} else if(type == 2) {
			var wrapWidth = contentWidth * 0.96;
			var wrapHeight = scaleHeight(width, wrapWidth, height);
			curDirectJPG = "shot_h.jpg";
			$('#monitorWrap').style.maxWidth = '100%';
		}
		//计算分贝条高度
		var big = Math.max(width, height);
		var smallV = Math.min(width, height);
		var decibelHeight = scaleHeight(big, contentWidth * 0.96, smallV);
		$("#monitorDecibelBar").style.height = decibelHeight - 20 + 'px';
		$("#monitorDecibelBar").style.top = (contentHeight - decibelHeight + 20) / 2 + 'px';
		//重置canvas大小
		$('#monitorWrap').style.width = wrapWidth + 'px';
		$('#monitorWrap').style.height = wrapHeight + 'px';
		var canvasWidth = wrapWidth;
		var canvasHeight = wrapHeight;
		$("#monitorImg").width = canvasWidth;
		$("#monitorImg").height = canvasHeight;
		curDevice.width = wrapWidth;
		curDevice.height = wrapHeight;
	} else if(mode == constant.PIC_IN_PIC) {
		//操作画中画相应的canvas,分贝条
		if(type == 1) {
			removeClass($("#picFooter"), "monitor_footer_land");
			addClass($("#picFooter"), "monitor_footer_por");
			curDirectJPG = "shot_v.jpg";
			$("#picFooter").style.backgroundImage = "url(images/PicInPic_footer_02.png)";
			removeClass($("#callImg"),"landscape");
		} else if(type == 2) {
			removeClass($("#picFooter"), "monitor_footer_por");
			addClass($("#picFooter"), "monitor_footer_land");
			curDirectJPG = "shot_h.jpg";
			$("#picFooter").style.backgroundImage = "url(images/PicInPic_footer_01.png)";
			addClass($("#callImg"),"landscape");
		}
		//切换底部图片
		curDevice.width = $("#picFooter").clientWidth;
		curDevice.height = scaleHeight(width, $("#picFooter").clientWidth, height);
		$("#picInPic").style.width = curDevice.width + 'px';
		$("#picInPic").style.height = curDevice.height + 'px';
		//重置canvas大小
		$("#picMonitorImg").width = $("#picMonitorImg").clientWidth;
		$("#picMonitorImg").height = $("#picMonitorImg").clientHeight;
		var height = $("#picMonitorContent").clientHeight;
		var footerHeight = $("#picFooter").clientHeight;
		var diffHeight = height - footerHeight;
		$("#smallDecibel").style.height = diffHeight - 20 + 'px';
		$("#smallDecibel").style.top = 10 + 'px';
		//横竖屏切换时改变正显示的提醒框样式
		if(oDialog.fnIsShow() && oDialog.alertType == 3) {
			if(type == 1) {
				removeClass($("#picAlertText"), "land_top_alert_confirm");
				addClass($("#picAlertText"), "top_alert_confirm");
			} else if(type == 2) {
				removeClass($("#picAlertText"), "top_alert_confirm");
				addClass($("#picAlertText"), "land_top_alert_confirm");
			}
		} else if(oDialog.fnIsShow() && oDialog.alertType == 1) {
			showAlert(constant.PIC_IN_PIC,true,true);
		}
	}
}

/*
 * @param srcWidth 原图片宽度
 * @param destWidth 目标图片宽度
 * @param srcHeight 原图片高度
 * @return 计算得到目标图片高度
 */
function scaleHeight(srcWidth, destWidth, srcHeight) {
	return parseInt(srcHeight * destWidth / srcWidth);
}

/*
 * @param srcWidth 原图片宽度
 * @param destWidth 目标图片高度
 * @param srcHeight 原图片宽度
 * @return 计算得到目标图片宽度
 */
function scaleWidth(srcHeight, destHeight, srcWidth) {
	return parseInt(srcWidth * destHeight / srcHeight);
}

/*
 * 视频录制时间
 */
var recordTime = {
	videoViewcount : 0,
	timeArray : null,
	isStop : false,
	init : function() {
		try {
			clearTimeout(recordTime.videoViewTimer);
		} catch(err) {
		}
		recordTime.videoViewcount = 0;
		recordTime.isStop = false;
		recordTime.timeArray = new Array();
		recordTime.timeArray[0] = 0;
		recordTime.timeArray[1] = 0;
		recordTime.timeArray[2] = 0;
		$("#monitorTime").innerText = "00:00:00";
	},
	onCount : function() {
		try {
			clearTimeout(recordTime.videoViewTimer);
		} catch(err) {
		}
		if(!recordTime.isStop) {
			recordTime.videoViewcount++;
		}
		if(recordTime.videoViewcount < 60) {
			recordTime.timeArray[0] = recordTime.videoViewcount;
		} else {
			recordTime.timeArray[0] = 0;
			if(recordTime.timeArray[1] < 60) {
				recordTime.timeArray[1] += 1;
			}
			if(recordTime.timeArray[1] == 60) {
				recordTime.timeArray[2] += 1;
				recordTime.timeArray[1] = 0;
			}
			recordTime.videoViewcount = 0;
		}
		var second = "";
		var minute = "";
		var hour = "";
		if(recordTime.timeArray[0] < 10) {
			second = "0" + recordTime.timeArray[0];
		} else if(recordTime.timeArray[0] >= 10) {
			second = "" + recordTime.timeArray[0];
		}
		if(recordTime.timeArray[1] < 10) {
			minute = "0" + recordTime.timeArray[1];
		} else if(recordTime.timeArray[1] >= 10) {
			minute = "" + recordTime.timeArray[1];
		}
		if(recordTime.timeArray[2] < 10) {
			hour = "0" + recordTime.timeArray[2];
		} else if(timeArray[2] >= 10) {
			hour = "" + recordTime.timeArray[2];
		}
		$("#monitorTime").innerText = hour + ":" + minute + ":" + second;

		recordTime.videoViewTimer = setTimeout(recordTime.onCount, 1000);
	},
	stopTime : function() {
		try {
			clearTimeout(recordTime.videoViewTimer);
		} catch(err) {
		}
	}
};
/**
 * loading动画
 */
var loading = {
	connectTimer : -1,
	stopLoading : function() {
		try {
			clearTimeout(loading.connectTimer);
		} catch(e) {
		}
		loading.connectTimer = -1;
	}
}

/**************
 * 提醒框
 ***************/
var oDialog = {
	isShow : false,
	callShow : false,
	time : -1,
	alertType : 0,
	currentType : 0,
	// callTimer : null,
	// callImages : ['images/Tel_calling_a.png','images/Tel_calling_b.png','images/Tel_calling_c.png','images/Tel_calling_d.png'],
	// callImageIndex : 0,
	//弹出提醒框
	fnPopUp : function(model, iType, sHtml) {
		this.currentType = iType;		
		if(iType != 5){
			this.isShow = true;
			this.alertType = iType;
		}
		if(iType == 5 && !this.callShow) {
			//来电提醒
			oDialog.fnPopUpTypeOne(model, sHtml);
			this.callShow = true;
		}else if(iType == 2 && !this.callShow) {
			//视屏中断				
			oDialog.fnInteruptView(model);
		} else if(iType != 5 && !this.callShow) {
			//分贝&电量提醒
			oDialog.fnPopUpTypeOne(model, sHtml);
		}
	},

	fnInteruptView : function(model) {
		if(model == constant.MONITOR_MODEL) {
			oDialog.fnHide();
			document.getElementById('monitorImg').setAttribute('hidden', 'true');
			var str = "<div>视屏中断<br>请检查手机客户端<br>或按<img src='images/red.png' style='margin:0 5px;'/>查看手动连接</div>";
			$('#bigInterrupt .content').innerHTML = str;
			$('#bigInterrupt').style.display = 'table';
		} else if(model == constant.PIC_IN_PIC) {
			oDialog.fnHide();
			if(curDevice.isLandscape)
				var str = "<p id='picAlertText' class='interrupt_p' style='top:15%;'>视频中断请检查<br/>手机客户端<br/>或查看手动连接</p>" + "<div><span class='key_menu'>手动连接</span></div>";
			else
				var str = "<p id='picAlertText' class='interrupt_p' style='top:7%;'>视频中断<br/>请检查<br/>手机客户端<br/>或查看<br/>手动连接</p>" + "<div><span class='key_menu'>手动连接</span></div>";
			document.getElementById('smallDialog').style.display = 'table';
			$('#smallDialog .background').style.opacity = 0.88;
			$('#picAlertText').style.display = 'table';
			$('#smallDialog .content').innerHTML = str;
		}
	},
	// fnChangeImage : function(callImage) {
		// if(oDialog.callImageIndex >= 4){
			// oDialog.callImageIndex = 0;
		// }
		// //content.querySelector('.callImage').src = oDialog.callImages[oDialog.callImageIndex++];
		// callImage.src = oDialog.callImages[oDialog.callImageIndex++];
		// oDialog.callTimer = setTimeout(function(){
			// oDialog.fnChangeImage(callImage);
		// },300);
	// },
	// fnStopChangeImage: function() {
		// if(null != oDialog.callTimer){
			// clearTimeout(oDialog.callTimer);	
		// }		
		// oDialog.callImageIndex = 0;
	// },
	fnPopUpTypeOne : function(model, sHtml) {
		if(model == constant.MONITOR_MODEL && this.currentType != 5) {
			var oMonitor = $('#monitor');
			document.getElementById('monitorImg').removeAttribute('hidden');
			document.getElementById('dialogOne').style.display = 'table';
			document.getElementById('dialogTwo').style.display = 'none';
			document.getElementById('thirdDialog').style.display = 'none';
			$('#dialogOne .content').innerHTML = sHtml;
		} else if(model == constant.PIC_IN_PIC && this.currentType != 5) {
			document.getElementById('smallDialog').style.display = 'table';
			$('#smallDialog .background').style.opacity = 0.88;
			$('#smallDialog .content').innerHTML = sHtml;
			$('#picAlertText').style.display = 'block';
			document.getElementById('smallCallDialog').style.display = 'none';
		} else if(model == constant.MONITOR_MODEL && this.currentType == 5) {
			document.getElementById('thirdDialog').style.display = 'block';
			document.getElementById('dialogOne').style.display = 'none';
			//来电提醒动画效果
			//oDialog.fnChangeImage(document.getElementById('MonitorCallImg'));
		} else if(model == constant.PIC_IN_PIC && this.currentType == 5) {
			if(curDevice.isLandscape){
				document.getElementById('TelCallImg').style = 'top:7%; line-height:350%';
			}else{
				document.getElementById('TelCallImg').style = 'top:10%; line-height: 400%';
			}
			document.getElementById('smallCallDialog').style.display = 'block';
			document.getElementById('smallDialog').style.display = 'none';
			//来电提醒动画效果
			//oDialog.fnChangeImage(document.getElementById('smalCallImg'));
		}
	},
	fnPopUpTypeTwo : function() {
		oDialog.isShow = true;
		document.getElementById('dialogOne').style.display = 'none';
		document.getElementById('dialogTwo').style.display = 'block';
	},
	fnIsShow : function() {
		return oDialog.isShow || oDialog.callShow;
	},
	fnAutoClose : function(timeout) {
		if(timeout != 0) {
			oDialog.time = setTimeout(oDialog.fnClose, timeout);
		}
	},
	fnClose : function() {
		// try {
			// clearTimeout(oDialog.time);
			// oDialog.fnStopChangeImage();
		// } catch(e) {
		// }
		oDialog.callShow = false;
		oDialog.isShow = false;
		oDialog.fnHide();
	},
	fnHide : function() {
		document.getElementById('monitorImg').removeAttribute('hidden');
		document.getElementById('dialogOne').style.display = 'none';
		document.getElementById('dialogTwo').style.display = 'none';
		document.getElementById('thirdDialog').style.display = 'none';
		$('#bigInterrupt').style.display = 'none';
		if(document.getElementById('smallDialog')) {
			document.getElementById('smallDialog').style.display = 'none';
		}
		if(document.getElementById('smallCallDialog')) {
			document.getElementById('smallCallDialog').style.display = 'none';
		}
	},
	fnClosePopup : function() {
		if(oDialog.currentType == 5) {
			document.getElementById('thirdDialog').style.display = 'none';
			document.getElementById('smallCallDialog').style.display = 'none';
			oDialog.currentType = 0;
			oDialog.callShow = false;
			// oDialog.fnStopChangeImage();
			//showCalling = false;
			//resetCall();
			if(oDialog.isShow) {
				if(decibelAndBatteryObj.model == constant.MONITOR_MODEL) {
					document.getElementById('dialogOne').style.display = 'table';
				} else if(decibelAndBatteryObj.model == constant.PIC_IN_PIC) {
					document.getElementById('smallDialog').style.display = 'table';
				}
			}			
		} else if(oDialog.isShow) {
			document.getElementById('dialogOne').style.display = 'none';
			document.getElementById('smallDialog').style.display = 'none';
			decibelAndBatteryObj.decibelIsTimeout = true;
			decibelAndBatteryObj.setDecibelTimeout();
			oDialog.isShow = false;
			if(oDialog.callShow) {
				if(decibelAndBatteryObj.model == constant.MONITOR_MODEL) {
					document.getElementById('thirdDialog').style.display = 'block';
				} else if(decibelAndBatteryObj.model == constant.PIC_IN_PIC) {
					document.getElementById('smallCallDialog').style.display = 'block';
				}
			}
		} else {
			document.getElementById('thirdDialog').style.display = 'none';
			document.getElementById('smallCallDialog').style.display = 'none';
			oDialog.callShow = false;
			showCalling = false;
			resetCall();
			// oDialog.fnStopChangeImage();
		}
	}
}

/**********************************************************
 *动态加载js
 * example:
 * init obj
 * o={};
 * o.url=url;
 * o.timeout=5000;
 * o.asyn = true;
 * o.cache= true;//不要缓存
 * o.complete=function(){};
 * o.data=null;
 * o.dataType='script';
 * o.error=function(){};
 * o.success=function(){};
 *
 */
var SX = {
	keyword : ["url", "timeout", "cache", "complete", "data", "dataType", "error", "success"], //定义用到的关键字
	_JsonObj : null,
	timer : -1,
	Timeout : function() {
		try {
			SX.timer = setTimeout(function() {
				try {
					clearTimeout(SX.timer);
				} catch(e) {
				}
				//终止本次请求
				try {
					SX.StopOnload();
				} catch(e) {
				}
				SX._Ajax.error();
				//回调出错函数
			}, SX._Ajax.timeout);
		} catch(e) {
		}
	},
	Ajax : function(obj) {
		for(var o in obj) {//得到参数
			for(var i = 0; i < SX.keyword.length; i++) {
				if(o == SX.keyword[i]) {
					SX._Ajax[o] = obj[o];
				}
			}
		}
		SX.XHR();
		//初始化_JsonObj对象
		SX._JsonObj.onload = function() {//设置回调函数
			try {
				if(SX.timer && clearTimeout) {
					clearTimeout(SX.timer);
				}
			} catch(e) {
			}
			setTimeout(SX._Ajax.success, 500);
		}
		if(SX._Ajax.timeout != 0) {
			try {
				SX.Timeout();
			} catch(e) {
			}
			//开始计算超时
		}
		SX.GetStart();
	},
	_Ajax : {//代理对象，拥有部分默认配置
		url : '',
		timeout : 0,
		cache : true,
		complete : function() {
		},
		data : {},
		dataType : 'script', //xml,html,script,json,jsonp
		error : function() {
		},
		success : function() {
		}
	},
	XHR : function() {
		SX._JsonObj = document.createElement('script');
		SX._JsonObj.id = 'jsonp';
		var temp = document.getElementById('jsonp');
		if(temp) {
			document.body.replaceChild(SX._JsonObj, temp);
			temp.onload = null;
			temp = null;
		} else {
			document.body.appendChild(SX._JsonObj);
		}

	},
	GetStart : function() {
		var url = SX._Ajax.url;
		url += '?';
		if(SX._Ajax.cache) {//如果不要缓存
			url += "__SX__=" + curDate.getCurDate();
		}

		SX._JsonObj.src = url;
	},
	StopOnload : function() {
		try {
			clearTimeout(SX.timer);
		} catch(e) {
		}
		try {
			var temp = document.getElementById('jsonp');
			if(temp) {
				document.body.replaceChild(SX._JsonObj, temp);
				temp.onload = null;
				temp = null;
			}
		} catch(e) {
		}
		SX._JsonObj = null;
	}
}
/*
 * 添加class样式
 */
function addClass(oElement, sName) {
	if(!oElement)
		return;
	var sPrevName = oElement.className.trim();
	if(!sPrevName) {
		oElement.className = sName;
	} else if(sPrevName.indexOf(sName) == -1) {
		oElement.className = sPrevName + ' ' + sName;
	}
}
/*
 * 移除class样式
 */
function removeClass(oElement, sName) {
	if(!oElement)
		return;
	var sPrevName = oElement.className;
	if(sPrevName.indexOf(sName) != -1) {
		sPrevName = sPrevName.replace(sName, '').trim();
		if(sPrevName) {
			oElement.className = sPrevName;
		} else {
			oElement.removeAttribute('class');
		}
	}
}

/*
 * 初始化资源
 */
var controller = (function() {
	//加载按键监听
	document.getElementsByTagName('body')[0].onkeydown = function() {
		var event = window.event || arguments[0];
		keyPressListener(event);
	}
	var tv = window.opera.tv;
	//取得工厂对象
	var oModelFactory = new ModelFactory();
	var oModel = null;
	var oNextModel = null;
	//判断当前跳转model
	var modelString = location.hash.substring(1);
	if(modelString == 'connecting') {
		var request = getRequest();
		curDevice.url = request.ip;
		oModel = oModelFactory.createModel(constant.MONITOR_MODEL);
		setModel(oModel);
		oModel.fnStartMonitor();
	} else {
		if(oPersistentInfo == null || oPersistentInfo.ip == '') {
			//第一次执行取得introModel
			oNextModel = oModelFactory.createModel(constant.INTRO_MODEL);
			setModel(oNextModel);
		} else {
			//正在连接页面
			oNextModel = oModelFactory.createModel(constant.CONNECTING_MODEL);
			setModel(oNextModel);
			isFirst = false;
		}
	}

	function setModel(oNextModel) {
		if(oNextModel) {
			if(oModel && oModel.fnDispose) {
				oModel.fnDispose();
			}
			oModel = oNextModel;
			if(oModel.fnInit) {
				oModel.fnInit();
			}
		}
	}

	//处理按键事件
	function keyPressListener(evt) {
		switch(evt.keyCode) {
			case tv.VK_ENTER: {
				if(oModel && oModel.fnEnter) {
					evt.preventDefault();
					evt.stopPropagation();
					oModel.fnEnter(controller);
				}
				break;
			}
			case tv.VK_BACK_SPACE: {
				if(oModel && oModel.fnBackSpace) {
					evt.preventDefault();
					evt.stopPropagation();
					oModel.fnBackSpace(controller);
				}
				break;
			}
			case tv.VK_RED: {
				if(oModel && oModel.fnRed) {
					evt.preventDefault();
					evt.stopPropagation();
					oModel.fnRed(controller);
				}
				break;
			}
			case tv.VK_GREEN: {
				if(oModel && oModel.fnGreen) {
					evt.preventDefault();
					evt.stopPropagation();
					oModel.fnGreen(controller);
				}
				break;
			}
			case tv.VK_YELLOW: {
				break;
			}
			case tv.VK_BLUE: {
				if(oModel && oModel.fnBlue) {
					evt.preventDefault();
					evt.stopPropagation();
					oModel.fnBlue(controller);
				}
				break;
			}
			case tv.VK_UP: {
				if(oModel && oModel.fnUp) {
					evt.preventDefault();
					evt.stopPropagation();
					oModel.fnUp(controller);
				}
				break;
			}
			case tv.VK_DOWN: {
				if(oModel && oModel.fnDown) {
					evt.preventDefault();
					evt.stopPropagation();
					oModel.fnDown(controller);
				}
				break;
			}
			case tv.VK_LEFT: {
				if(oModel && oModel.fnLeft) {
					evt.preventDefault();
					evt.stopPropagation();
					oModel.fnLeft(controller);
				}
				break;
			}
			case tv.VK_RIGHT: {
				if(oModel && oModel.fnRight) {
					evt.preventDefault();
					evt.stopPropagation();
					oModel.fnRight(controller);
				}
				break;
			}
			default:
				break;
		}
	}
	
	//工厂对象返回值
	return {
		fnGetModel : function() {
			return oModel;
		},
		fnSetModel : function(oNextModel) {
			setModel(oNextModel);
		},
		fnGetFactory : function() {
			return oModelFactory;
		}
	};
})();
/**
 * model factory
 */
function ModelFactory() {
	/*******************
	 * 公共变量和方法
	 *******************/
	//定义battery的图标
	var oBatteryImgs = {
		'20%' : 'images/battery_20.png',
		'40%' : 'images/battery_40.png'
	};
	var curImg = null;
	//隐藏所有view
	function fnHideAll() {
		var aDivs = $$('#monitor > div');
		var iLen = aDivs.length;
		for(var i = 0; i < iLen; i++) {
			aDivs[i].style.display = 'none';
		}
		document.getElementById('picInPic').style.display = 'none';
		document.getElementById('hideMonitor').style.display = 'none';
	}

	//页面切换功能
	function fnNavigateTo(sModelName) {
		switch(sModelName) {
			case constant.INTRO_MODEL:
				fnHideAll();
				document.getElementById('introView').style.display = 'block';
				if(isFirst) {
					document.getElementById('introInitial').style.display = 'block';
					document.getElementById('introIntro').style.display = 'none';
				} else {
					document.getElementById('introInitial').style.display = 'none';
					document.getElementById('introIntro').style.display = 'block';
				}
				fnChangeTitle('功能介绍');
				break;
			case constant.HELP_MODEL:
				fnHideAll();
				document.getElementById('helpView').style.display = 'block';
				fnChangeTitle('帮助信息');
				break;
			case constant.CONNECTING_MODEL:
				fnHideAll();
				document.getElementById('title').style.display = 'block';
				document.getElementById('monitor').style.display = 'block';
				document.getElementById('loadingView').style.display = 'table';
				document.getElementById('monitorFooter').style.display = 'block';
				document.getElementById('monitorViewFooter').style.display = 'none';
				document.getElementById('ipInputFooter').style.display = 'block';
				fnChangeTitle('婴视宝');
				break;
			case constant.MANUAL_CONNECT_MODEL:
				fnHideAll();
				document.getElementById('monitor').style.display = 'block';
				document.getElementById('ipInputView').style.display = 'table';
				document.getElementById('monitorFooter').style.display = 'block';
				document.getElementById('monitorViewFooter').style.display = 'none';
				document.getElementById('ipInputFooter').style.display = 'block';
				fnChangeTitle('手动连接');
				break;
			case constant.MONITOR_MODEL:
				fnHideAll();
				document.getElementById('video').style.width = 68 + '%';
				document.getElementById('video').style.height = 100 + '%';
				document.getElementById('monitor').style.display = 'block';
				document.getElementById('title').style.display = 'block';
				document.getElementById('monitorFooter').style.display = 'block';
				document.getElementById('monitorViewFooter').style.display = 'block';
				document.getElementById('ipInputFooter').style.display = 'none';
				document.getElementById('monitor_view').style.display = 'block';
				document.getElementById('picInPic').style.display = 'none';
				fnChangeTitle(curDevice.name, true);
				break;
			case constant.PIC_IN_PIC:
				document.getElementById('video').style.width = 100 + '%';
				document.getElementById('video').style.height = 100 + '%';
				document.getElementById('monitor').style.display = 'none';
				document.getElementById('picInPic').style.display = 'block';
				document.getElementById('hideMonitor').style.display = 'none';
				document.getElementById('picMonitorContent').style.display = 'block';
				document.getElementById('picFooter').style.display = 'block';
				document.getElementById('smallDialog').style.display = 'none';
				break;
			default:
				break;
		}
	}

	//改变标题和是否显示battery
	function fnChangeTitle(titleName, isShowBattery) {
		document.getElementById('titleName').innerText = titleName;
		if(isShowBattery) {
			document.getElementById('batteryImg').style.display = 'inline';
		} else {
			document.getElementById('batteryImg').style.display = 'none';
		}
	}

	//显示不同的battery
	function fnShowBattery(sPercent) {
		var sImgSrc = oBatteryImgs[sPercent];
		if(sImgSrc) {
			document.getElementById('batteryImg').src = sImgSrc;
		}
	}

	var monitorImg = document.getElementById('monitorImg');
	var picMonitorImg = document.getElementById('picMonitorImg');
	/****************************
	 * 画图到Canvas上面
	 */
	function drawImageToCanvas(mode) {
		try {
			if(curImg != null) {
				if(mode == 1) {
					//画中画模式
					var width = monitorImg.width;
					var height = monitorImg.height;
					var ctx = monitorImg.getContext('2d');
					var y = (height - curDevice.height) / 2;
					var x = (width - curDevice.width) / 2;
					ctx.drawImage(curImg, x, y, curDevice.width, curDevice.height);
				} else {
					var width = picMonitorImg.width;
					var height = picMonitorImg.height;
					var ctx = picMonitorImg.getContext('2d');
					var y = (height - curDevice.height) / 2;
					var x = (width - curDevice.width) / 2;
					ctx.drawImage(curImg, x, y, curDevice.width, curDevice.height);
				}
			}
		} catch(e) {

		}
	}

	function getRatio(width, imgWidth, height, imgHeight) {
		var imgWidth = (imgWidth > width) ? width : imgWidth;
		var imgHeight = (imgHeight > height) ? height : imgHeight;
		return Math.min(imgWidth / width, imgHeight / height);
	}

	/**
	 * 画面监控公用变量和函数
	 */
	var forCheckImageLoadTimer = null;
	var checkErrorCount = 0;
	var isClearTime = true;
	function forCheckImageLoad() {
		if(curImg) {
			checkErrorCount++;
			forCheckImageLoadTimer = setTimeout(function() {
				recordTime.isStop = true;
				if(!small) {
					var url = "http://" + curDevice.url + ":" + curDevice.port + "/" + curDirectJPG + "?t=" + curDate.getCurDate();
					curImg.src = url;
				}
				forCheckImageLoad();
			}, 1000);
			if(checkErrorCount > 6) {
				checkErrorCount = 0;
				//显示视频中断，停止计时
				try {
					clearTimeout(forCheckImageLoadTimer);
				} catch(e) {
				}
				if(mobileConnect) {
					mobileConnect = false;
					fnNavigateTo(constant.MONITOR_MODEL);
					initCanvas(constant.MONITOR_MODEL);
				}
				if(!oDialog.isShow || (oDialog.alertType != 2 && !oDialog.callShow)) {
					oDialog.fnPopUp(decibelAndBatteryObj.model, 2, "");
				}
				forCheckImageLoad();
			}
		}
	}

	function fnGetScreenImg() {
		return curDevice.isLandscape ? 'shot_h.jpg' : 'shot_v.jpg';
	}
	
	function initCanvas(model) {
		if(curDevice.width <= curDevice.height) {
			changeDirect(1, model, curDevice.width, curDevice.height);
		} else if(curDevice.width > curDevice.height) {
			changeDirect(2, model, curDevice.width, curDevice.height);
		}
	}

	function fnDecibalInit(model) {
		decibelAndBatteryObj.setModel(model);
		decibelAndBatteryObj.init();
		decibelAndBatteryObj.callback = function() {
			if(small) {
				checkErrorCount = 0;
				clearTimeout(forCheckImageLoadTimer);
				forCheckImageLoad();
				recordTime.isStop = false;
			}
			if(oDialog.fnIsShow()) {
				if(oDialog.alertType == 2) {
					oDialog.fnClose();
				}
			}
			showRealDecibelAndBatteryImg(decibelAndBatteryObj.model);
			if(mobileConnect) {
				mobileConnect = false;
				fnNavigateTo(constant.MONITOR_MODEL);
				initCanvas(model);
			}
			parseTelXml(wbm_info, decibelAndBatteryObj.model);
			if(!titleChanged) {
				fnChangeTitle(curDevice.name, true);
				titleChanged = true;
			}
		}
		decibelAndBatteryObj.batteryAndDecibelMonitor();
	}

	/**
	 * introPage model
	 */
	this.introModel = (function() {
		//intro局部变量定义
		//方法定义
		return {
			fnInit : function() {
				location.hash = 'intro';
				fnNavigateTo(constant.INTRO_MODEL);
			},
			fnEnter : function(controller) {
				if(isFirst) {
					controller.fnSetModel(controller.fnGetFactory().createModel(constant.HELP_MODEL));
					isFirst = false;
				}
			},
			fnBackSpace : function() {
				if(isFirst) {
					return;
				}
				controller.fnSetModel(controller.fnGetFactory().createModel(constant.HELP_MODEL));
			}
		};
	})();
	/**
	 * helpPage model
	 */
	this.helpModel = (function() {
		//help局部变量定义
		//方法定义
		return {
			fnInit : function() {
				location.hash = 'help';
				fnNavigateTo(constant.HELP_MODEL);
			},
			fnEnter : function() {

			},
			fnBackSpace : function(controller) {
				fnCloseWindow();
			},
			fnRed : function(controller) {
				controller.fnSetModel(controller.fnGetFactory().createModel(constant.MANUAL_CONNECT_MODEL));
				controller.fnGetModel().initIp(true);
			},
			fnBlue : function(controller) {
				isFirst = false;
				controller.fnSetModel(controller.fnGetFactory().createModel(constant.INTRO_MODEL));
			}
		}
	})();

	/**
	 * connecting model
	 */
	this.connectingModel = (function() {
		//help局部变量定义
		var titleName = "婴视宝";
		var ip = "";
		var url = "";
		//方法定义
		return {
			fnInit : function() {
				location.hash = 'connecting';
				if(oPersistentInfo) {
					ip = oPersistentInfo.ip;
				}
				fnNavigateTo(constant.CONNECTING_MODEL);
				fnChangeTitle(titleName);
				if(ip != null && ip != "") {
					url = "http://" + ip + ":" + curDevice.port + "/info.js";
					var o = {};
					o.url = url;
					o.timeout = 5000;
					o.cache = true;
					//不要缓存
					o.complete = function() {
					};
					o.error = function(jsonObj, errorThrown) {
						loading.stopLoading();
						controller.fnSetModel(controller.fnGetFactory().createModel(constant.HELP_MODEL));
					};
					o.success = function() {
						loading.stopLoading();
						//跳转到监控画面
						parseTelXml(wbm_info, constant.MONITOR_MODEL);
						controller.fnSetModel(controller.fnGetFactory().createModel(constant.MONITOR_MODEL));
						controller.fnGetModel().fnDispose();
						controller.fnGetModel().fnStartMonitor();
					};
					function delay() {
						SX.Ajax(o);
					}

					setTimeout(delay, 500);
				}
			},
			fnBackSpace : function(controller) {
				SX.StopOnload();
				loading.stopLoading();
				controller.fnSetModel(controller.fnGetFactory().createModel(constant.HELP_MODEL));
			}
		}
	})();
	/*
	 * 手动连接模块
	 */
	this.mamualConnectModel = (function() {
		//help局部变量定义
		var aIp = [1, 9, 2, 1, 6, 8, 0, 0, 0, 0, 0, 0];
		var iCount = 6;
		var iMaxCount = 12;
		var oArrowUp = $('#arrowIpUp');
		var oArrowDown = $('#arrowIpDown');
		var isFirst = true;
		var isConnecting = false;
		var url = "";
		var connectTimer;

		//返回下一个或上一个点
		function nextCount(isPrev) {
			removeClass($('#ipInput .selected'), 'selected');
			if(isPrev) {
				if(--iCount < 0) {
					iCount = iMaxCount;
				}
			} else {
				if(++iCount > iMaxCount) {
					iCount = 0;
				}
			}
			if(iCount >= 0 && iCount < iMaxCount) {
				oArrowUp.style.display = 'block';
				oArrowDown.style.display = 'block';
				fnMoveFocus(iCount);
			} else {
				oArrowUp.style.display = 'none';
				oArrowDown.style.display = 'none';
				addClass($('#connectBtn'), 'selected');
			}
			return iCount;
		}

		//根据iCount得到ip输入框
		function fnGetIpSpan(iCount) {
			return $('#ipInput span:nth-child(' + (2 + iCount) + ')');
		}

		//移动箭头
		function fnMoveFocus(i) {
			iCount = i;
			var oSpan = fnGetIpSpan(iCount);
			addClass(oSpan, 'selected');
			oArrowUp.style.left = oSpan.offsetLeft - 4 + 'px';
			oArrowDown.style.left = oSpan.offsetLeft - 4 + 'px';
		}

		function getIPValue() {
			var tmpIp1 = parseInt(100 * aIp[0] + 10 * aIp[1] + 1 * aIp[2]);
			var tmpIp2 = parseInt(100 * aIp[3] + 10 * aIp[4] + 1 * aIp[5]);
			var tmpIp3 = parseInt(100 * aIp[6] + 10 * aIp[7] + 1 * aIp[8]);
			var tmpIp4 = parseInt(100 * aIp[9] + 10 * aIp[10] + 1 * aIp[11]);
			var ip = tmpIp1 + "." + tmpIp2 + "." + tmpIp3 + "." + tmpIp4;
			return ip;
		}

		function fnFocusTo(i) {
			iCount = i - 1;
			nextCount();
		}

		//方法定义

		return {
			fnInit : function() {
				location.hash = 'mamualConnect';
				fnNavigateTo(constant.MANUAL_CONNECT_MODEL);
				isConnecting = false;
				canEnter = true;
				var oSpan = $$('#ipInput span');
				for(var i = 0; i < aIp.length; i++) {
					oSpan[i].innerText = aIp[i];
				}
				fnFocusTo(6);
			},
			fnEnter : function() {
				removeClass($('#connectBtn'), 'selected');
				if(!oDialog.fnIsShow()) {
					if(iCount == iMaxCount) {
						isConnecting = true;
						canEnter = true;
						fnNavigateTo(constant.CONNECTING_MODEL);
						var ip = getIPValue();
						if(ip != null && ip != "") {
							url = "http://" + ip + ":" + curDevice.port + "/info.js?t=" + curDate.getCurDate();
							var a = {};
							a.url = url;
							a.timeout = 5000;
							//不要缓存
							a.cache = true;
							a.complete = function() {
							};
							a.error = function() {
								if(!canEnter) {
									canEnter = true;
									return;
								}
								loading.stopLoading();
								document.getElementById('loadingView').style.display = 'none';
								document.getElementById('title').style.display = 'none';
								document.getElementById('monitorFooter').style.display = 'none';
								oDialog.fnPopUpTypeTwo();
								oDialog.fnAutoClose(3000);
								connectTimer = setTimeout(function() {
									isConnecting = false;
									fnNavigateTo(constant.MANUAL_CONNECT_MODEL);
									fnFocusTo(6);
								}, 3000);
							};
							a.success = function() {
								if(!canEnter) {
									canEnter = true;
									return;
								}
								small = false;
								isConnecting = false;
								loading.stopLoading();
								oDialog.fnClose();
								isFirst = true;
								parseTelXml(wbm_info, constant.MONITOR_MODEL);
								//保存信息
								if(oPersistentInfo == null) {
									oPersistentInfo = {};
								}
								isClearTime = true;
								oPersistentInfo.ip = ip;
								saveValue();
								//跳转到监控画面
								controller.fnSetModel(controller.fnGetFactory().createModel(constant.MONITOR_MODEL));
								controller.fnGetModel().fnShowDecibel();
								controller.fnGetModel().fnDispose();
								controller.fnGetModel().fnStartMonitor();
							};
							function delay() {
								SX.Ajax(a);
							}

							setTimeout(delay, 500);
						}
					} else {
						nextCount();
					}
				}
			},
			fnBackSpace : function(controller) {
				if(oDialog.fnIsShow()) {
					fnFocusTo(12);
					loading.stopLoading();
					oDialog.fnClose();
					SX.StopOnload();
					clearTimeout(connectTimer);
					controller.fnSetModel(controller.fnGetFactory().createModel(constant.MANUAL_CONNECT_MODEL));
				} else if(isConnecting) {
					isConnecting = false;
					canEnter = false;
					fnNavigateTo(constant.MANUAL_CONNECT_MODEL);
					SX.StopOnload();
					fnFocusTo(12);
				} else if(isMonitor) {
					isMonitor = false;
					isClearTime = false;
					controller.fnSetModel(controller.fnGetFactory().createModel(constant.MONITOR_MODEL));
					controller.fnGetModel().fnStartMonitor();
					if(isInterrupt) {
						isInterrupt = false;
						oDialog.fnPopUp(decibelAndBatteryObj.model, 2, "");
					}
				} else if(isPicInPic) {
					isPicInPic = false;
					controller.fnSetModel(controller.fnGetFactory().createModel(constant.PIC_IN_PIC));
					controller.fnGetModel().fnStartMonitor();
					if(isInterrupt) {
						isInterrupt = false;
						oDialog.fnPopUp(decibelAndBatteryObj.model, 2, "");
					}
				} else if(small) {
					small = false;
					controller.fnSetModel(controller.fnGetFactory().createModel(constant.PIC_IN_PIC));
					controller.fnGetModel().fnStartMonitor();
					setTimeout(function() {
						sendImg.src = "http://" + curDevice.url + ":" + curDevice.port + "/stop_shot.html?t=" + Date.now();
					}, 500);
					if(isInterrupt) {
						isInterrupt = false;
						oDialog.fnPopUp(decibelAndBatteryObj.model, 2, "");
					}
				} else {
					isFirst = true;
					aIp = [1, 9, 2, 1, 6, 8, 0, 0, 0, 0, 0, 0];
					controller.fnSetModel(controller.fnGetFactory().createModel(constant.HELP_MODEL));
				}
			},
			initIp : function(isInit) {
				aIp = [1, 9, 2, 1, 6, 8, 0, 0, 0, 0, 0, 0];
				isFirst = isInit;
				if(isFirst) {
					var oSpan = $$('#ipInput span');
					for(var i = 0; i < aIp.length; i++) {
						oSpan[i].innerText = aIp[i];
					}
					fnFocusTo(6);
					isFirst = false;
				}
			},
			fnUp : function(controller) {
				if(!oDialog.fnIsShow()) {
					if(iCount >= 0 && iCount < iMaxCount) {
						if(++aIp[iCount] > 9) {
							aIp[iCount] = 0;
						}
						fnGetIpSpan(iCount).innerText = aIp[iCount];
					}
				}
			},
			fnDown : function(controller) {
				if(!oDialog.fnIsShow()) {
					if(iCount >= 0 && iCount < iMaxCount) {
						if(--aIp[iCount] < 0) {
							aIp[iCount] = 9;
						}
						fnGetIpSpan(iCount).innerText = aIp[iCount];
					}
				}
			},
			fnLeft : function(controller) {
				if(!oDialog.fnIsShow()) {
					nextCount(-1);
				}
			},
			fnRight : function(controller) {
				if(!oDialog.fnIsShow()) {
					nextCount();
				}
			},
		}
	})();
	/**
	 * monitor view
	 */
	this.monitorModel = (function() {
		//intro局部变量定义
		var isShowDecibelBar = false;
		var changingTimer = null;
		var decibelImgFloat = document.getElementById("decibelImgFloat");
		var decibelAlertNum = document.getElementById("decibelAlertNum");
		var sendImg = new Image();
		var firstEnter = true;
		var decibelTimer = null;
		var decibelTime = 10000;
		function showDecibelBar() {
			if(isShowDecibelBar) {
				$("#monitorDecibelBar").style.display = 'block';
				$("#monitorViewFooter").src = 'images/guide.png';
			} else {
				$("#monitorDecibelBar").style.display = 'none';
				$("#monitorViewFooter").src = 'images/prompt_landscape_footer.png';
			}
		}

		function resetChanging() {
			clearTimeout(changingTimer);
			isChanging = true;
			changingTimer = setTimeout(function() {
				isChanging = false;
			}, 5000);
		}
		
		function resetDecibelTimer() {
			clearTimeout(decibelTimer);
			decibelTimer = setTimeout(function() {
				isShowDecibelBar = false;
				showDecibelBar();
			}, decibelTime);
		}

		//方法定义
		return {
			fnInit : function() {
				location.hash = 'monitor';
				if(request.ip && firstEnter) {
					mobileConnect = true;
					firstEnter = false;
					fnNavigateTo(constant.CONNECTING_MODEL);
				} else {
					fnNavigateTo(constant.MONITOR_MODEL);
					initCanvas(constant.MONITOR_MODEL);
				}
				fnDecibalInit(constant.MONITOR_MODEL);
				currentType = 0;
				isShowDecibelBar = false;
				titleChanged = false;
				showDecibelBar();
			},
			fnShowDecibel : function(isShow) {
				isShowDecibelBar = isShow;
				showDecibelBar();
			},
			fnDispose : function() {
				try {
					clearTimeout(forCheckImageLoadTimer);
				} catch(e) {
				}
				forCheckImageLoadTimer = null;
				checkErrorCount = 0;
				isClearTime = true;
				isShowDecibelBar = false;
				if(curImg) {
					curImg.onload = null;
					curImg.src = "";
				}
				curImg = null;
			},
			fnStartMonitor : function() {
				try {
					clearTimeout(forCheckImageLoadTimer);
				} catch(e) {
				    alert("ClearTimeout forCheckImageLoadTimer error!");
				}
				if(isClearTime) {
					recordTime.init();
					isClearTime = false;
				}
				recordTime.videoViewTimer = setTimeout(recordTime.onCount, 1000);
				curImg = new Image();
				try {
					var url = "http://" + curDevice.url + ":" + curDevice.port + "/" + curDirectJPG + "?t=" + curDate.getCurDate();
					curImg.onload = function() {
						try {
							recordTime.isStop = false;
							clearTimeout(forCheckImageLoadTimer);
						} catch(e) {
						}
						if(curImg.complete){
							checkErrorCount = 0;
							drawImageToCanvas(1);							
							curImg.src = "http://" + curDevice.url + ":" + curDevice.port + "/" + curDirectJPG + "?t=" + curDate.getCurDate();
						}
						//隐藏视频中断，继续计时
						forCheckImageLoad();						
					}
					curImg.src = url;
					forCheckImageLoad();
				} catch(e) {
					alert("fnStartMonitor error!");
				}
				showRealDecibelAndBatteryImg(constant.MONITOR_MODEL);
			},
			fnEnter : function(controller) {
				//if(mobileConnect) return;
				//当显示来电提醒窗口时,发动停止弹出的请求
				if(oDialog.callShow || oDialog.currentType == 5) {
					setTimeout(function() {
						sendImg.src = "http://" + curDevice.url + ":" + curDevice.port + "/reset_iscaller.html?t=" + Date.now();
					}, 500);
				}
				if(oDialog.fnIsShow() && oDialog.alertType != 2) {
					oDialog.fnClosePopup();
				}
			},
			fnBackSpace : function() {
				//if(mobileConnect) return;
				//if(!oDialog.fnIsShow() || oDialog.alertType == 2) {
				//	recordTime.stopTime();
				//	recordTime.isStop = true;
				//	recordTime.stopTime();
				//	fnCloseWindow();
				//}
			},
			fnGreen : function() {
				if(!oDialog.fnIsShow()) {
					var img = $('#monitorImg');
					img.onload = null;
					curImg = null;
					small = false;
					controller.fnSetModel(controller.fnGetFactory().createModel(constant.PIC_IN_PIC));
					controller.fnGetModel().fnStartMonitor();
				}
			},
			fnRed : function() {
				if(!oDialog.fnIsShow() || oDialog.alertType == 2) {
					if(oDialog.fnIsShow() && oDialog.alertType == 2) {
						isInterrupt = true;
					}
					oDialog.fnClose();
					this.fnDispose();
					recordTime.stopTime();
					recordTime.isStop = true;
					isMonitor = true;
					recordTime.stopTime();
					decibelAndBatteryObj.clear();
					decibelAndBatteryObj.setModel(constant.MANUAL_CONNECT_MODEL);
					controller.fnSetModel(controller.fnGetFactory().createModel(constant.MANUAL_CONNECT_MODEL));
				}
			},
			fnBlue : function() {
				if(!oDialog.fnIsShow()) {
					if(isShowDecibelBar) {
						isShowDecibelBar = false;
						clearTimeout(decibelTimer);
					} else {
						isShowDecibelBar = true;
						resetDecibelTimer();
					}
					showDecibelBar();
				} else {
					if(oDialog.alertType == 2) {
						if(isShowDecibelBar) {
							isShowDecibelBar = false;
							clearTimeout(decibelTimer);
						} else {
							isShowDecibelBar = true;
							resetDecibelTimer();
						}
						showDecibelBar();
					}
				}
			},
			fnUp : function() {
				if(isShowDecibelBar) {
					resetChanging();
					resetDecibelTimer();
					if(++lDecibel > 99)
						lDecibel = 99;
					var iDecibel = parseInt(lDecibel * 101 / 99) - 1;
					decibelImgFloat.style.top = 100 - iDecibel + '%';
					decibelAlertNum.innerHTML = '提醒分贝&nbsp;' + '<span>' + lDecibel + '</span>';
					sendImg.src = 'http://' + curDevice.url + ':' + curDevice.port + '/decibel.html?t=' + new Date().getTime() + '&' + 'alertDecibel=' + lDecibel;
				}
			},
			fnDown : function() {
				if(isShowDecibelBar) {
					resetChanging();
					resetDecibelTimer();
					if(--lDecibel < 1)
						lDecibel = 1;
					var iDecibel = parseInt(lDecibel * 101 / 99) - 1;
					decibelImgFloat.style.top = 100 - iDecibel + '%';
					decibelAlertNum.innerHTML = '提醒分贝&nbsp;' + '<span>' + lDecibel + '</span>';
					sendImg.src = 'http://' + curDevice.url + ':' + curDevice.port + '/decibel.html?t=' + new Date().getTime() + '&' + 'alertDecibel=' + lDecibel;
				}
			}
		};
	})();

	this.picInPicModel = (function() {
		//intro局部变量定义
		var border = $('#picInPic').style.border;
		var url = "";
		var sendImg = new Image();
		//方法定义
		return {
			fnInit : function() {
				location.hash = 'picInPic';
				fnNavigateTo(constant.PIC_IN_PIC);
				showCalling = true;
				if(!small) {
					small = false;
					$('#picMonitorContent').style.display = 'block';
					$('#picFooter').style.display = 'block';
					$('#hideMonitor').style.display = 'none';
					$('#picInPic').style.border = border;
				} else {
					small = true;
					$('#picMonitorContent').style.display = 'none';
					$('#picFooter').style.display = 'none';
					$('#hideMonitor').style.display = 'block';
					$('#picInPic').style.border = 'none';
				}
				fnDecibalInit(constant.PIC_IN_PIC);
				currentType = 0;
				initCanvas(constant.PIC_IN_PIC);
			},
			fnStartMonitor : function() {
				try {
					clearTimeout(forCheckImageLoadTimer);
				} catch(e) {
				}
				curImg = new Image();
				try {
					var url = "http://" + curDevice.url + ":" + curDevice.port + "/" + curDirectJPG + "?t=" + curDate.getCurDate();
					curImg.onload = function() {
						if(small) {
							curImg.src = "";
							return;
						}
						try {
						    recordTime.isStop = false;
							clearTimeout(forCheckImageLoadTimer);
						} catch(e) {
						}
						checkErrorCount = 0;
						drawImageToCanvas(2);
						curImg.src = "http://" + curDevice.url + ":" + curDevice.port + "/" + curDirectJPG + "?t=" + curDate.getCurDate();
						//隐藏视频中断，继续计时
						forCheckImageLoad();
					}
					curImg.src = url;
					forCheckImageLoad();
				} catch(e) {
				}
				showRealDecibelAndBatteryImg(constant.PIC_IN_PIC);
			},
			fnEnter : function(controller) {
				//if(mobileConnect) return;
				//当显示来电提醒窗口时,发动停止弹出的请求
				if(oDialog.callShow || oDialog.currentType == 5) {
					setTimeout(function() {
						sendImg.src = "http://" + curDevice.url + ":" + curDevice.port + "/reset_iscaller.html?t=" + Date.now();
					}, 500);
				}
				if(oDialog.fnIsShow() && oDialog.alertType != 2) {
					oDialog.fnClosePopup();
				}
			},
			fnDispose : function() {
				try {
					clearTimeout(forCheckImageLoadTimer);
				} catch(e) {
				}
				forCheckImageLoadTimer = null;
				checkErrorCount = 0;
				isShowDecibelBar = false;
				if(curImg) {
					curImg.onload = null;
					curImg.src = "";
				}
				curImg = null;
			},
			fnBackSpace : function() {
				if(!oDialog.fnIsShow() && small == false) {
					var img = $('#picMonitorImg');
					img.onload = null;
					curImg = null;
					img.src = "";
					isClearTime = false;
					controller.fnSetModel(controller.fnGetFactory().createModel(constant.MONITOR_MODEL));
					controller.fnGetModel().fnStartMonitor();
				}
			},
			fnRed : function() {
				if(oDialog.fnIsShow()) {
					if(oDialog.alertType == 2) {
						oDialog.fnClose();
						this.fnDispose();
						recordTime.stopTime();
						recordTime.isStop = true;
						recordTime.stopTime();
						isPicInPic = true;
						isInterrupt = true;
						decibelAndBatteryObj.clear();
						decibelAndBatteryObj.setModel(constant.MANUAL_CONNECT_MODEL);
						controller.fnSetModel(controller.fnGetFactory().createModel(constant.MANUAL_CONNECT_MODEL));
					}
				} else if(small) {
					small = false;
					$('#picMonitorContent').style.display = 'block';
					$('#picFooter').style.display = 'block';
					$('#hideMonitor').style.display = 'none';
					$('#picInPic').style.border = border;
					fnDecibalInit(constant.PIC_IN_PIC);
					curImg.src = url;
				} else {
					small = true;
					$('#picMonitorContent').style.display = 'none';
					$('#picFooter').style.display = 'none';
					$('#hideMonitor').style.display = 'block';
					$('#picInPic').style.border = 'none';
					fnDecibalInit(constant.PIC_IN_PIC);
					setTimeout(function() {
						sendImg.src = "http://" + curDevice.url + ":" + curDevice.port + "/stop_shot.html?t=" + Date.now();
					}, 500);
				}
			}
		};
	})();
	this.createModel = function(sModeName) {
		var oModel;
		switch(sModeName) {
			case constant.INTRO_MODEL:
				oModel = this.introModel;
				break;
			case constant.HELP_MODEL:
				oModel = this.helpModel;
				break;
			case constant.CONNECTING_MODEL:
				oModel = this.connectingModel;
				break;
			case constant.MANUAL_CONNECT_MODEL:
				oModel = this.mamualConnectModel;
				break;
			case constant.MONITOR_MODEL:
				oModel = this.monitorModel;
				break;
			case constant.PIC_IN_PIC:
				oModel = this.picInPicModel;
				break;
			default:
				oModel = null;
		}
		return oModel;
	}
}