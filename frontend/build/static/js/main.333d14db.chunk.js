(this.webpackJsonpfrontend=this.webpackJsonpfrontend||[]).push([[0],{230:function(e,t,n){},232:function(e,t,n){},237:function(e,t){},238:function(e,t){},246:function(e,t){},251:function(e,t,n){"use strict";n.r(t);var r=n(36),i=n.n(r),c=n(205),o=n.n(c),u=(n(230),n(8)),a=n.n(u),s=n(12),l=n(7),d=(n(232),n(206)),f=n.n(d),v=(n(250),n(224)),b=function(e){return new Promise((function(t){return setTimeout(t,e)}))};var h=n(42);var j=function(){var e=Object(r.useRef)(),t=Object(r.useRef)(),n=Object(r.useState)(),i=Object(l.a)(n,2),c=i[0],o=i[1],u=Object(r.useState)(),d=Object(l.a)(u,2),j=d[0],p=d[1],O=Object(r.useState)(localStorage.getItem("CameraId")||{}),g=Object(l.a)(O,2),x=g[0],w=g[1],m=Object(r.useState)([]),y=Object(l.a)(m,2),S=y[0],k=y[1],I=Object(r.useState)(null),C=Object(l.a)(I,2),E=C[0],R=C[1];Object(r.useEffect)((function(){window.addEventListener("resize",(function(e){window.location.reload()}))}),[]),function(e,t){var n=Object(r.useRef)();Object(r.useEffect)((function(){n.current=e}),[e]),Object(r.useEffect)((function(){if(null!==t){var e=setInterval((function(){n.current()}),t);return function(){return clearInterval(e)}}}),[t])}(Object(s.a)(a.a.mark((function n(){var r,i,o,u;return a.a.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(c&&e.current&&(null===(r=e.current)||void 0===r?void 0:r.video)&&4===e.current.video.readyState&&(null===c||void 0===c?void 0:c.estimateSinglePose)&&(null===(i=t.current)||void 0===i?void 0:i.getContext)){n.next=2;break}return n.abrupt("return");case 2:return n.next=4,c.estimateSinglePose(e.current.video,{flipHorizontal:!0});case 4:o=n.sent,p(o),u=t.current.getContext("2d"),{x:o.keypoints[0].position.x,y:o.keypoints[0].position.y},u.clearRect(0,0,u.canvas.width,u.canvas.height),u.fillStyle="red",o.keypoints.filter((function(e){return e.score>.1})).forEach((function(e){u.fillRect(e.position.x,e.position.y,6,6)}));case 11:case"end":return n.stop()}}),n)}))),50);var F=Object(r.useCallback)((function(e){k(e.filter((function(e){return"videoinput"===e.kind})))}),[k]),P=Object(r.useCallback)(function(){var n=Object(s.a)(a.a.mark((function n(r){var i;return a.a.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:console.log(r,e.current.video);case 1:if(r.active&&e.current.video&&4===e.current.video.readyState&&t.current){n.next=6;break}return n.next=4,b(50);case 4:n.next=1;break;case 6:r.active&&e.current.video&&(i={w:e.current.video.videoWidth,h:e.current.video.videoHeight},R(i),t.current.height=i.h,t.current.width=i.w,e.current.video.height=i.h,e.current.video.width=i.w,T({width:i.w,height:i.h}).then((function(e){o(e)})));case 7:case"end":return n.stop()}}),n)})));return function(e){return n.apply(this,arguments)}}(),[]);function T(e){return D.apply(this,arguments)}function D(){return(D=Object(s.a)(a.a.mark((function e(t){var n,r,i;return a.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=t.width,r=t.height,console.log("Loading posenet..."),e.next=4,v.a({architecture:"MobileNetV1",outputStride:16,inputResolution:{width:n,height:r},multiplier:.75});case 4:return i=e.sent,console.log("loaded posenet."),e.abrupt("return",i);case 7:case"end":return e.stop()}}),e)})))).apply(this,arguments)}return Object(r.useEffect)((function(){navigator.mediaDevices.enumerateDevices().then(F)}),[F]),Object(h.jsx)(h.Fragment,{children:Object(h.jsxs)("div",{children:[Object(h.jsx)("select",{value:x,onChange:function(e){w(e.currentTarget.value),localStorage.setItem("CameraId",e.currentTarget.value)},children:S.map((function(e,t){return Object(h.jsx)("option",{value:e.deviceId,children:e.label||"Device ".concat(t+1)},e.deviceId)}))}),Object(h.jsx)("br",{}),Object(h.jsxs)("div",{style:{position:"relative",minHeight:500},children:[Object(h.jsx)(f.a,{ref:e,audio:!1,mirrored:!0,videoConstraints:{deviceId:x},onUserMedia:P,style:{position:"absolute",top:0,left:0}},JSON.stringify(E)),Object(h.jsx)("canvas",{ref:t,style:{position:"absolute",top:0,left:0,zIndex:999999}})]}),Object(h.jsx)("br",{}),Object(h.jsxs)("pre",{children:["w: ",null===E||void 0===E?void 0:E.w," h: ",null===E||void 0===E?void 0:E.h," ",Object(h.jsx)("br",{}),JSON.stringify(j,null,4)]})]})})},p=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,253)).then((function(t){var n=t.getCLS,r=t.getFID,i=t.getFCP,c=t.getLCP,o=t.getTTFB;n(e),r(e),i(e),c(e),o(e)}))};o.a.render(Object(h.jsx)(i.a.StrictMode,{children:Object(h.jsx)(j,{})}),document.getElementById("root")),p()}},[[251,1,2]]]);
//# sourceMappingURL=main.333d14db.chunk.js.map