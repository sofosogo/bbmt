/**
 * 实时显示当前声音和当前电量
 */
var bg_height = 100;
var showCalling = true;
var callTimer = null;
function showRealDecibelAndBatteryImg(model) {
	/**
	 * 警告显示
	 */
	if(curDevice.decibel < 0) curDevice.decibel = 0;
	if(curDevice.decibel > curDevice.alertDecibel) {
		if(curDevice.battery > 10) {
			if(!oDialog.isShow && !decibelAndBatteryObj.decibelIsTimeout) {
				//显示dialog,分贝警告
				showAlert(model, true, false);
			}
		} else if(curDevice.battery <= 10) {
			if(!oDialog.isShow || oDialog.alertType != 1) {
				if(!decibelAndBatteryObj.decibelIsTimeout) {
					//显示dialog,分贝电量警告
					showAlert(model, true, true);
				}
			} 
		}
	} else if(curDevice.decibel <= curDevice.alertDecibel) {
		 if(curDevice.battery <= 10) {
			if(!oDialog.isShow && !decibelAndBatteryObj.decibelIsTimeout) {
				//显示dialog,电量警告
				showAlert(model, false, true);
			}
		} 
	}
	/**
	 * 来电提醒
	 */
	//if(curDevice.iscaller && showCalling && !oDialog.callShow) {
	if(curDevice.iscaller && !oDialog.callShow) {
		oDialog.fnPopUp(model, 5, null);
	}
	
	/**
	 * 分贝显示
	 */
	if(curDevice.decibel <= 99) {
		var m_decibel_height = bg_height - curDevice.decibel;
		var alertDecibel = bg_height - curDevice.alertDecibel
		//声音中间图的坐标
		if(model == constant.MONITOR_MODEL) {
			$("#decibelTxtValue").innerText = curDevice.decibel;
			$("#decibelImgBg").style.height = m_decibel_height + '%';
		} else if(model == constant.PIC_IN_PIC) {
			$("#floatdecibelImgBg").style.height = curDevice.decibel + '%';
		}
		if(!isChanging) {
			$("#decibelAlertNum span").innerHTML = curDevice.alertDecibel;
			lDecibel = curDevice.alertDecibel;
			$("#decibelImgFloat").style.top = alertDecibel + '%';
		}

	} else {
		if(model == constant.MONITOR_MODEL) {
			$("#decibelTxtValue").innerText = curDevice.decibel;
			var m_decibel_height = 0;
			var alertDecibel = 25;
			$("#decibelImgBg").style.height = m_decibel_height + '%';
			$("#decibelImgFloat").style.top = alertDecibel + '%';
		} else if(model == constant.PIC_IN_PIC) {
			$("#floatdecibelImgBg").style.height = 0 + '%';
		}
	}
	/**
	 * 电量显示
	 */
	if(model == constant.MONITOR_MODEL) {
		if(curDevice.battery <= 5) {
			$("#batteryImg").src = "images/battery_5.png";
		} else if(curDevice.battery <= 10) {
			$("#batteryImg").src = "images/battery_10.png";
		} else if(curDevice.battery <= 20) {
			$("#batteryImg").src = "images/battery_20.png";
		} else if(curDevice.battery <= 40) {
			$("#batteryImg").src = "images/battery_40.png";
		} else if(curDevice.battery <= 60) {
			$("#batteryImg").src = "images/battery_60.png";
		} else if(curDevice.battery <= 80) {
			$("#batteryImg").src = "images/battery_80.png";
		} else if(curDevice.battery <= 100) {
			$("#batteryImg").src = "images/battery_100.png";
		} else {
			$("#batteryImg").src = "images/battery_100.png";
		}
	}
};

/*
 * description:弹出警告框,根据当前横竖屏来显示相应的内容
 * isAlert:是否显示警告
 * isDecibel:是否显示分贝警告
 * isBattery:是否显示电量警告
 */
function showAlert(model, isDecibel, isBattery) {
	//显示双画面监控时提醒框
	if(model == constant.MONITOR_MODEL) {
		if(isDecibel && isBattery) {
			//显示分贝和电量的警告
			var str = "<p id='alertText'>手机端分贝值已超过您的设定值了<br/>";
			str += "设定值:" + curDevice.alertDecibel + "分贝</p>";
			if(curDevice.battery <= 10 && curDevice.battery > 5) {
				str += "<p>电池电量低于10%<br/>请连接电源</p><p><img class='caution_button' src='images/caution_button_s.png'/></p>";
			} else if (curDevice.battery <= 5) {
				str += "<p>电池电量低于5%<br/>请连接电源</p><p><img class='caution_button' src='images/caution_button_s.png'/></p>";
			}
			oDialog.fnPopUp(model, 1, str);
		} else if(isDecibel && !isBattery) {
			//显示分贝的警告
			var str = "<p id='alertText'>手机端分贝值已超过您的设定值了<br>";
			str += "设定值:" + curDevice.alertDecibel + "分贝</p><p class='alert_confirm'><img class='caution_button' src='images/caution_button_s.png'/></p>";
			oDialog.fnPopUp(model, 3, str);
		} else if(isBattery && !isDecibel) {
			//显示电量的警告
			if (curDevice.battery <= 10 && curDevice.battery > 5) {
				var str = "<p id='alertText'>电池电量低于10%<br>请连接电源</p><p class='alert_confirm'><img class='caution_button' src='images/caution_button_s.png'/></p>";		
			} else if(curDevice.battery <= 5) {
				var str = "<p id='alertText'>电池电量低于5%<br>请连接电源</p><p class='alert_confirm'><img class='caution_button' src='images/caution_button_s.png'/></p>";
			}
			oDialog.fnPopUp(model, 4, str);
		}
		//显示画中画监控时提醒框
	} else if(model == constant.PIC_IN_PIC) {
		if(isDecibel && isBattery) {
			//显示分贝和电量的警告
			if(curDevice.isLandscape) {
				if(curDevice.battery <= 10 && curDevice.battery > 5) {
					var str = "<p id='picAlertText'>手机端分贝超过<br>您的设定值了</p><p>电池电量低于10%</p><p><img class='small_caution_button' src='images/caution_button.png'/></p>";
				} else if (curDevice.battery <= 5) {
					var str = "<p id='picAlertText'>手机端分贝超过<br>您的设定值了</p><p>电池电量低于5%</p><p><img class='small_caution_button' src='images/caution_button.png'/></p>";
				}
			}
			else {
				if(curDevice.battery <= 10 && curDevice.battery > 5) {
					var str = "<p id='picAlertText'>手机端<br/>分贝超过<br>您的设定值了</p><p>电池电量<br/>低于10%</p><p><img class='small_caution_button_land' src='images/caution_button.png'/></p>";
				} else if(curDevice.battery <= 5) {
					var str = "<p id='picAlertText'>手机端<br/>分贝超过<br>您的设定值了</p><p>电池电量<br/>低于5%</p><p><img class='small_caution_button_land' src='images/caution_button.png'/></p>";
				}
			}
			oDialog.fnPopUp(model, 1, str);
		} else if(!isBattery && isDecibel) {
			//显示分贝的警告
			if(curDevice.isLandscape) 
				var str = "<p id='picAlertText' class='land_top_alert_confirm'>手机端分贝超过<br>您的设定值了</p><p class='bottom_alert_confirm'><img class='small_caution_button' src='images/caution_button.png'/></p>";
			else
				var str = "<p id='picAlertText' class='top_alert_confirm'>手机端分贝超过<br>您的设定值了</p><p class='bottom_alert_confirm'><img class='small_caution_button_land' src='images/caution_button.png'/></p>";
			oDialog.fnPopUp(model, 3, str);
		} else if(isBattery && !isDecibel) {
			//显示电量的警告
			if(curDevice.isLandscape) {
				if(curDevice.battery <= 10 && curDevice.battery > 5) {
					var str = "<p id='picAlertText' class='top_alert_confirm'>电池电量低于10%</p><p class='bottom_alert_confirm'><img class='small_caution_button' src='images/caution_button.png'/></p>";
				} else if(curDevice.battery <= 5) {
					var str = "<p id='picAlertText' class='top_alert_confirm'>电池电量低于5%</p><p class='bottom_alert_confirm'><img class='small_caution_button' src='images/caution_button.png'/></p>";
				}
			} else {
				if(curDevice.battery <= 10 && curDevice.battery > 5) {
					var str = "<p id='picAlertText' class='top_alert_confirm'>电池电量低于10%</p><p class='bottom_alert_confirm'><img class='small_caution_button_land' src='images/caution_button.png'/></p>";
				} else if(curDevice.battery <= 5) {
					var str = "<p id='picAlertText' class='top_alert_confirm'>电池电量低于5%</p><p class='bottom_alert_confirm'><img class='small_caution_button_land' src='images/caution_button.png'/></p>";
				}
			}
			oDialog.fnPopUp(model, 4, str);
		}
	}
};

function resetCall() {
	callTimer = setTimeout(function(){
				showCalling = true;
	},300000);
}
/**
 * 分贝函数变量
 */
var decibelAndBatteryObj = {
	/**
	 * 初始化分贝信息
	 */
	bty_dcbl_timer : -1,
	decibelTimer : -1,
	decibelTimeout : 300000,
	decibelIsTimeout : false,
	model : "",
	setModel : function(m) {
		decibelAndBatteryObj.model = m;
	},
	clear : function() {
		try {
			clearTimeout(decibelAndBatteryObj.bty_dcbl_timer);
		} catch(error) {
		}
		try {
			clearTimeout(decibelAndBatteryObj.decibelTimer);
		} catch(error) {
		}		
		//10%的电量提示  5%的电量提示
		decibelAndBatteryObj.decibelIsTimeout = false;
		SX.StopOnload();
	},
	onTimeoutOfDecibel : function() {
		try {
			clearTimeout(decibelAndBatteryObj.decibelTimer);
		} catch(error) {
		}
		decibelAndBatteryObj.decibelIsTimeout = false;
	},
	setDecibelTimeout : function() {
		decibelAndBatteryObj.decibelTimer = setTimeout(decibelAndBatteryObj.onTimeoutOfDecibel, decibelAndBatteryObj.decibelTimeout);
	},
	callback : function(data) {
	},
	init : function() {
		try {
			clearTimeout(decibelAndBatteryObj.bty_dcbl_timer);
		} catch(error) {
		}
		try {
			clearTimeout(decibelAndBatteryObj.decibelTimer);
			clearTimeout(callTimer);
		} catch(error) {
		}
		if(decibelAndBatteryObj.model == constant.MONITOR_MODEL) {
			//分贝变量
			bg_height = 100;
			//顶部图的高度
			//电量分贝信息更新时的Timer
			$("#decibelImgBg").style.height = 100 + '%';

		} else if(decibelAndBatteryObj.model == constant.PIC_IN_PIC) {
			//分贝变量
			bg_height = 154;
			//背景图高度
			$("#floatdecibelImgBg").style.height = '50%';
		}
		decibelAndBatteryObj.decibelIsTimeout = false;
		showCalling = true;
	},
	requestJsonObj : function(url, callback) {
		var o = {};
		o.url = url;
		o.timeout = 0;
		//不要缓存
		o.cache = true;
		o.error = function(jsonObj, errorThrown) {
		};
		o.success = function() {
			callback();
		};
		setTimeout(function(){SX.Ajax(o);},500);
	},
	batteryAndDecibelMonitor : function() {
		var url = "http://" + curDevice.url + ":" + curDevice.port + "/info.js";
		decibelAndBatteryObj.requestJsonObj(url, decibelAndBatteryObj.callback);
		try {
			clearTimeout(decibelAndBatteryObj.bty_dcbl_timer);
		} catch(error) {}
		decibelAndBatteryObj.bty_dcbl_timer = setTimeout(decibelAndBatteryObj.batteryAndDecibelMonitor, 1000);
	}
};
