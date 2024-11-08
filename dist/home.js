(()=>{"use strict";let e=[];document.addEventListener("DOMContentLoaded",(()=>{const n=document.getElementById("user-info"),o=document.getElementById("logout"),t=document.getElementById("phishing-form"),r=document.getElementById("phishing-list");chrome.runtime.sendMessage({action:"getToken"},(e=>{const o=e.token;o&&fetch("https://zitadel.databending.ca/oidc/v1/userinfo",{method:"GET",headers:{Authorization:`Bearer ${o}`}}).then((e=>e.json())).then((e=>{console.log("User info:",e),n.innerHTML=`\n                        <p><strong>Name:</strong> ${e.name}</p>\n          <p><strong>Email:</strong> ${e.email}</p>\n                        <p><strong>Subject:</strong> ${e.sub}</p>\n                    `})).catch((e=>{console.error("Error fetching user info:",e),n.innerHTML="<p>Error fetching user info</p>"}))})),t.addEventListener("submit",(n=>{n.preventDefault();const o=n.target.url.value;o?chrome.runtime.sendMessage({action:"getJWT"},(n=>{const t=n.jwt;t?fetch("http://localhost:5000/api/v1/llm_mock",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({url:o})}).then((e=>e.json())).then((n=>{console.log("Data from server:",n),e.push({url:o,score:n.message}),e.forEach((e=>{const n=e.url,o=e.score,t=document.createElement("div");t.innerHTML=`\n                                <p><strong>URL:</strong> ${n}</p>\n                                <p><strong>Score:</strong> ${o}</p>\n                            `,r.appendChild(t)}))})).catch((e=>{console.error("Error fetching data:",e)})):console.error("JWT is empty")})):console.error("URL is empty")})),chrome.runtime.sendMessage({action:"getLinks"},(n=>{const o=n.links;o?(e=o,e.forEach((e=>{const n=e.url,o=e.score,t=document.createElement("div");t.innerHTML=`\n                    <p><strong>URL:</strong> ${n}</p>\n                    <p><strong>Score:</strong> ${o}</p>\n                `,r.appendChild(t)}))):console.error("Links are empty")})),o.addEventListener("click",(()=>{chrome.runtime.sendMessage({action:"clearToken"},(e=>{const n=e.message;n?chrome.storage.local.clear().then((()=>{console.log("Token cleared:",n),chrome.action.setPopup({popup:"popup.html"}),window.location.href="popup.html"})):console.error("Error clearing token")}))}))}))})();