import{r as i}from"./index-WRKZqFJu.js";var c={exports:{}},f={};/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var u=i;function S(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var l=typeof Object.is=="function"?Object.is:S,p=u.useState,d=u.useEffect,v=u.useLayoutEffect,E=u.useDebugValue;function h(e,t){var r=t(),o=p({inst:{value:r,getSnapshot:t}}),n=o[0].inst,a=o[1];return v(function(){n.value=r,n.getSnapshot=t,s(n)&&a({inst:n})},[e,r,t]),d(function(){return s(n)&&a({inst:n}),e(function(){s(n)&&a({inst:n})})},[e]),E(r),r}function s(e){var t=e.getSnapshot;e=e.value;try{var r=t();return!l(e,r)}catch{return!0}}function y(e,t){return t()}var x=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?y:h;f.useSyncExternalStore=u.useSyncExternalStore!==void 0?u.useSyncExternalStore:x;c.exports=f;var m=c.exports;const b=m.useSyncExternalStore;function g(e,t){return typeof e=="function"?e(...t):!!e}export{g as a,m as s,b as u};
