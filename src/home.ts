let list_of_urls = [] as any[];

document.addEventListener('DOMContentLoaded', () => {
    const userInfoDiv = document.getElementById('user-info') as HTMLDivElement;
    const logout = document.getElementById('logout') as HTMLButtonElement;
    const phishingForm = document.getElementById('phishing-form') as HTMLFormElement;
    const phishingList = document.getElementById('phishing-list') as HTMLDivElement;

    chrome.runtime.sendMessage({ action: 'getToken' }, (response) => {
        const accessToken = response.token;
        if (accessToken) {
            fetch('https://zitadel.databending.ca/oidc/v1/userinfo', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    console.log('User info:', data);
                    userInfoDiv.innerHTML = `
                        <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
                        <p><strong>Subject:</strong> ${data.sub}</p>
                    `;
                })
                .catch(error => {
                    console.error('Error fetching user info:', error);
                    userInfoDiv.innerHTML = '<p>Error fetching user info</p>';
                });
        } else {
            console.error('Access token is empty');
            userInfoDiv.innerHTML = '<p>Access token is empty</p>';
        }

    });

    phishingForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const url = form.url.value;

        if (!url) {
            console.error('URL is empty');
            return;
        }


        chrome.runtime.sendMessage({ action: 'getJWT' }, (response) => {
            const jwt = response.jwt;
            if (jwt) {
                fetch('http://localhost:5000/api/v1/llm_mock', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwt}`
                    },
                    body: JSON.stringify({ url: url })
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Data from server:', data);

                        list_of_urls.push({ url: url, score: data.message });

                        list_of_urls.forEach((item) => {
                            const url = item.url;
                            const score = item.score;
                            const phishingItem = document.createElement('div');
                            phishingItem.innerHTML = `
                                <p><strong>URL:</strong> ${url}</p>
                                <p><strong>Score:</strong> ${score}</p>
                            `;
                            phishingList.appendChild(phishingItem);
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                    });
            } else {
                console.error('JWT is empty');
            }
        });
    });


    logout.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'clearToken' }, (response) => {
            const message = response.message;
            if (message) {
                console.log(message);
            } else {
                console.error('Error clearing token');
            }
        });
        window.location.href = 'popup.html';
    });
});
