const postingManageUrl = 'https://post.data.org/manage'
const accountClLink = 'https://accounts.data.org/login'
const vehicleGoGoLink = "https://dev.inventory.vehiclegogo.com"

class ExecuteScripts {
    constructor(fileName = 'implementedFunctions.js') {
        this.isMainScript = true;
        this.tabId = 0;
        this.fileName = fileName;
        this.token = undefined;
        this.postingData = {};
        this.listener = undefined;
        this.isError = false;
        this.items = [];
        this.accountCL = null;
    }

    setTabId(tabId) {
        this.tabId = tabId
    }

    setIsError(isError) {
        this.isError = isError
    }

    setItems(items) {
        this.items = items
    }

    async getToken() {
        try {
            this.token = await new Promise((resolve, reject) => {
                chrome.tabs.query({url: `${vehicleGoGoLink}/*`},
                    async (tabs) => {
                    for await (let tab of tabs) {
                        chrome.scripting.executeScript(
                            {
                                target: {tabId: tab.id},
                                func: () => {
                                    return JSON.stringify(window.localStorage);
                                },
                            },
                            async (result) => {
                                if (chrome.runtime.lastError) {
                                    console.error(chrome.runtime.lastError);
                                    reject(chrome.runtime.lastError);
                                } else {
                                    const storage = JSON.parse(result[0].result);
                                    if (storage?.token) {
                                        console.log('token', storage.token)
                                        resolve(storage.token)
                                    }
                                }
                            },
                        );
                    }
                });
            })
        } catch (e) {
            console.log('getToken Error', e?.message || e)
            throw e
        }
    }

    async getWorkerId() {
        const me = await fetch(`${vehicleGoGoLink}/api/me`, {
            method: 'GET',
            headers: {Authorization: 'Bearer ' + this.token}
        })
        const {worker_id} = await me.json();

        if (!worker_id) throw new Error('worker id not found')
        return worker_id
    }

    async setPostingData(itemId) {
        try {

            const workerId = await this.getWorkerId()

            const response = await fetch(`${vehicleGoGoLink}/api/worker/${workerId}/plans/data?status=Urgent&plan_ids[]=${itemId}`, {
                method: 'GET'
            })
            const {data} = await response.json()
            this.postingData = data[0]

        } catch (e) {
            console.log('setPostingData error : ', e?.message || e)
            throw e
        }
    }

    setListener(listener) {
        this.listener = listener
    }

    _getSerializableItems(array) {
        return array.filter(item => !!item);
    }

    _preparingQuery(itemsId) {
        return itemsId.reduce((acc, id, idx) => {
            acc += `&plan_ids[${idx}]=${id}`;
            return acc
        }, '')
    }

    async getItems(planIds) {
        if (!planIds) return
        try {
            const workerId = await this.getWorkerId(planIds);
            const query = this._preparingQuery(planIds)
            const response = await fetch(`${vehicleGoGoLink}/api/worker/${workerId}/plans/data?status=Successful${query}`, {
                method: 'GET'
            })
            const {data: res} = await response.json();

            const rawData = res.map(item => {
                return {
                    id: item.id,
                    accountCL: item?.account_name,
                    itemName: item.item.main.postingTitle.value,
                    category: item.item.name
                }
            })

            return rawData.filter(({accountCL}) => accountCL)

        } catch (err) {
            console.log('getStatusData error : ', err?.response?.data || err.message)
            throw err
        }
    }

    execute(args = [], cb, cbResult) {
        const argsSerialized = this._getSerializableItems(args)
        chrome.scripting.executeScript({
                target: {tabId: this.tabId},
                files: [this.fileName],
            },
            () => {
                chrome.scripting.executeScript({
                        target: {tabId: this.tabId},
                        function: cb,
                        args: argsSerialized
                    },
                    async (result) => cbResult(result)
                )
            }
        );
    }

    handleError(errorText = undefined) {
        this.execute(
            [errorText],
            async (errorText) => {
                errorLoader(1, errorText)
            },
            async () => {
                try {

                    const workerId = await this.getWorkerId()

                    const {itemIdx} = await chrome.storage.local.get('itemIdx')

                    const idx = itemIdx ? itemIdx : 0;

                    console.log('this.items', this.items)
                    console.log('idx', idx)
                    console.log('this.items[idx].id', this.items[idx].id)

                    await fetch(`${vehicleGoGoLink}/api/extensionLogs`, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            Authorization: 'Bearer ' + this.token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            source: "extension",
                            error: errorText || 'something went wrong',
                            description: this.isMainScript ? 'Error in main scenario' : 'error in DeletePost',
                            worker_plan_id: this?.postingData?.id || this.items[idx].id || 1,
                            worker_id: workerId
                        })
                    })
                    if (this.isMainScript) {
                        if (this.postingData?.id) await fetch(`${vehicleGoGoLink}/api/worker/workerPlans?plans_ids[0]=${this.postingData.id}&status=Failed`, {
                            method: 'PUT',
                            headers: {
                                Authorization: 'Bearer ' + this.token,
                                Accept: 'application/json'
                            }
                        })
                    }
                    if (this.listener) chrome.tabs.onUpdated.removeListener(this.listener);

                    await chrome.storage.local.set({itemIdx: 0})

                    setTimeout(() => {
                        chrome.tabs.remove(this.tabId);
                    }, 30000)

                } catch (e) {
                    console.log('ERR: ', e.message)
                }
            }
        )
        this.isError = true
    }

    deletePosts() {
        this.execute(
            [this.items],
            async (items) => {
                try {
                    const delayError = setTimeout(() => {
                        throw new Error('Long waiting')
                    }, 60000)
                    loader(1, "Please wait. We're changing the status of the sold unit.")
                    let {itemIdx} = await chrome.storage.local.get('itemIdx')
                    const idx = itemIdx ? itemIdx : 0;
                    const accountCL = items[idx].accountCL;
                    const isThaSameAccount = await checkAccount(accountCL);
                    if (!isThaSameAccount) throw new Error(`This is not the account from which the unit was published.  Authorize in ${accountCL} account`)
                    const result = await deletePosts(items[idx]);
                    let reload = result === 'reload';
                    if (result) {
                        if (items.length < (idx + 1)) {
                            await chrome.storage.local.set({itemIdx: idx + 1})
                        } else return {executed: true}

                    }
                    if (reload) return {reload: true}

                    clearTimeout(delayError)

                } catch (err) {
                    return {error: err?.message || err.toString()}
                }
            },
            async (results) => {
                if (results[0].result && results[0].result?.error) {
                    this.handleError(results[0].result.error);
                }
                if (results[0].result && results[0].result?.executed) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    await chrome.tabs.remove(this.tabId)
                }

                if (results[0].result && results[0].result?.reload) {
                    await chrome.tabs.update(this.tabId, {url: accountClLink + '/home'});
                }
            }
        )
    }

    mainPage() {
        this.execute(
            [this.postingData?.profile?.location_city || 'error'],
            async (city) => {
                try {
                    const delayError = setTimeout(() => {
                        throw new Error('Long waiting times')
                    }, 30000)
                    loader()
                    const accountCL = await getAccountName();
                    await clickGoOnMainPage(city);
                    clearTimeout(delayError)
                    return {'accountCL': accountCL}
                } catch (e) {
                    return {error: e?.message || e.toString()}
                }
            },
            (results) => {
                if (results[0].result?.accountCL) this.accountCL = results[0].result?.accountCL
                if (results[0].result && results[0].result?.error) {
                    if (results[0].result?.error === "no auth") {
                        this.handleError(`Please authorise <a target="_blank" href="https://data.org" >https://data.org</a> and re-post the ad`);
                    } else {
                        this.handleError()
                    }
                }
            }
        )
    }

    type() {
        this.execute(
            ['for sale by worker'],
            async (selector) => {
                try {
                    const delayError = setTimeout(() => {
                        throw new Error('Long waiting times')
                    }, 30000)
                    loader()
                    await selectRadioBtn(selector);
                    clearTimeout(delayError)
                } catch (e) {
                    return {error: e?.message || e.toString()}
                }
            },
            (results) => {
                if (results[0].result && results[0].result?.error) {
                    this.handleError();
                }
            }
        )
    }

    subarea() {
        try {
            const profile = this.postingData?.profile
            let arg = 'error'
            if (profile?.location_district) arg = profile.location_district
            this.execute(
                [arg],
                async (selector) => {
                    try {
                        const delayError = setTimeout(() => {
                            throw new Error('Long waiting times')
                        }, 30000)
                        loader()
                        await selectRadioBtn(selector);
                        clearTimeout(delayError)
                    } catch (e) {
                        return {error: e?.message || e.toString()}
                    }
                },
                (results) => {
                    if (results[0].result && results[0].result?.error) {
                        this.handleError();
                    }
                }
            )
        } catch (e) {
            console.log(e)
        }
    }

    hood() {
        this.execute(
            ['bypass this step'],
            async (selector) => {
                try {
                    const delayError = setTimeout(() => {
                        throw new Error('Long waiting times')
                    }, 30000)
                    loader()
                    await selectRadioBtn(selector);
                    clearTimeout(delayError)
                } catch (e) {
                    return {error: e?.message || e.toString()}
                }
            },
            (results) => {
                if (results[0].result && results[0].result?.error) {
                    this.handleError();
                }
            }
        )
    }

    cat() {
        this.execute(
            [this.postingData.item.name],
            async (selector) => {
                try {
                    const delayError = setTimeout(() => {
                        throw new Error('Long waiting times')
                    }, 30000)
                    loader()
                    await selectRadioBtnCat(selector);
                    clearTimeout(delayError)
                } catch (e) {
                    return {error: e?.message || e.toString()}
                }
            },
            (results) => {
                if (results[0].result && results[0].result?.error) {
                    this.handleError();
                }
            }
        )
    }

    edit() {
        this.execute(
            [this.postingData.item],
            async (data) => {
                try {
                    const delayError = setTimeout(() => {
                        throw new Error('Long waiting times')
                    }, 30000)
                    const errorItem = document.querySelector('.error-list')
                    if (errorItem) throw new Error('ERROR')
                    loader()
                    await fillAd(data);
                    clearTimeout(delayError)
                } catch (e) {
                    return {error: e?.message || e.toString()}
                }
            },
            (results) => {
                if (results[0].result && results[0].result?.error) {
                    this.handleError();
                }
            }
        )
    }

    geoverify() {
        this.execute(
            [],
            async () => {
                try {
                    const delayError = setTimeout(() => {
                        throw new Error('Long waiting times')
                    }, 30000)
                    loader()
                    await geoVerify();
                    clearTimeout(delayError)
                } catch (e) {
                    return {error: e?.message || e.toString()}
                }
            },
            (results) => {
                if (results[0].result && results[0].result?.error) {
                    this.handleError();
                }
            }
        )
    }

    editimage() {
        const arg = this.postingData?.item?.images || []
        this.execute(
            [arg],
            async (imgLink) => {
                try {
                    loader()
                    await uploadImg(imgLink);
                } catch (e) {
                    return {error: e?.message || e.toString()}
                }
            },
            (results) => {
                if (results[0].result && results[0].result?.error) {
                    this.handleError();
                }
            }
        )
    }

    preview() {
        this.execute(
            [],
            async () => {
                try {
                    const delayError = setTimeout(() => {
                        throw new Error('Long waiting times')
                    }, 30000)
                    loader()
                    await publish();
                    clearTimeout(delayError)
                } catch (e) {
                    return {error: e?.message || e.toString()}
                }
            },
            async (results) => {
                if (results[0].result && results[0].result?.error) {
                    this.handleError();
                } else {

                    let id = this.postingData?.id

                    fetch(`${vehicleGoGoLink}/api/worker/workerPlans?plans_ids[0]=${id}&status=Successful&account_name=${this.accountCL}`, {
                        method: 'PUT',
                        headers: {
                            Authorization: 'Bearer ' + this.token,
                            Accept: 'application/json'
                        }
                    }).catch(err => {
                        this.handleError();
                    })

                    if (this.listener) chrome.tabs.onUpdated.removeListener(this.listener);
                }

            }
        )
    }
}

let exclusionTabs = [];

chrome.tabs.query({url: ["*://*.data.org/*", "*://*.vehiclegogo.com/*"]}, (tabs) => {
    console.log('tabs', tabs)
    for (let tab of tabs) {
        exclusionTabs.push(tab.id);
    }
});

//send a message to the front that the extension is installed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.startsWith(vehicleGoGoLink)) {
        chrome.scripting.executeScript({
            target: {tabId},
            files: ['contentScript.js']
        })
            .then(() => {
                console.log("Injected the content script.");
                chrome.scripting.executeScript({
                    target: {tabId: tabId},
                    function: (tabId) => {

                        (() => chrome.runtime.sendMessage({message: 'ex', tabId}))()

                    }, args: [tabId]
                });
            })
            .catch(err => console.error(err));
    }
});

//main scenario
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
        const executeScripts = new ExecuteScripts();
        executeScripts.setIsError(false)

        switch (request?.message) {
            case 'ex': {
                await chrome.scripting.executeScript({
                    target: {tabId: request.tabId},
                    function: (id) => {
                        const event = new CustomEvent('extensionEvent', {detail: chrome.runtime.id || id});
                        window.EXTENSION_ID = chrome.runtime.id || id
                        const extensionElement = document.getElementById('extension-id')
                        if (extensionElement) extensionElement.setAttribute('data-ex-id', chrome.runtime.id || id)
                        document.dispatchEvent(event);
                    },
                    args: [chrome.runtime.id]
                })
                return sendResponse({success: true});
            }
            case 'status' : {
                try {
                    await chrome.storage.local.clear()
                    chrome.tabs.create({url: accountClLink + '/home'}, async (newTab) => {
                        try {
                            await executeScripts.getToken();
                            const itemIds = request?.itemId;
                            const isHomePage = newTab.url !== accountClLink + '/home';
                            executeScripts.setTabId(newTab.id)
                            const items = await executeScripts.getItems(itemIds);
                            if (items) executeScripts.setItems(items)

                            chrome.tabs.onUpdated.addListener(async function listener(tabId, changeInfo, tab) {
                                if (exclusionTabs.includes(tabId)) return;
                                executeScripts.setTabId(tabId)

                                if (tab.url.startsWith(postingManageUrl)) {
                                    await chrome.tabs.update(tabId, {url: accountClLink + '/home'});
                                }

                                if (!isHomePage) executeScripts.handleError("Please log in data")

                                if (executeScripts.isError) {
                                    executeScripts.handleError()
                                    return
                                }

                                executeScripts.setListener(listener)

                                if (changeInfo.status === 'complete') {
                                    await executeScripts.deletePosts();
                                }

                                sendResponse({success: true});

                            })
                        } catch (error) {
                            console.error('Error:: ', error)
                        }
                    })
                } catch (error) {
                    console.error('Error:: ', error)
                }

                return
            }
            case 'posting' : {
                try {
                    chrome.tabs.create({url: accountClLink}, async (newTab) => {
                        executeScripts.setTabId(newTab.id)

                        await executeScripts.getToken();

                        await executeScripts.setPostingData(request.itemId)

                        executeScripts.mainPage()

                        chrome.tabs.onUpdated.addListener(async function listener(tabId, changeInfo, tab) {

                            if (tabId !== newTab.id) return;

                            if (executeScripts.isError) {
                                executeScripts.handleError()
                                return
                            }

                            executeScripts.setListener(listener)

                            if (changeInfo.status === 'complete') {
                                const params = new URL(tab.url).searchParams;

                                if (params.get('s') === 'subarea') {
                                    executeScripts.subarea()
                                } else if (params.get('s') === 'hood') {
                                    executeScripts.hood()
                                } else if (params.get('s') === 'type') {
                                    executeScripts.type()
                                } else if (params.get('s') === 'cat') {
                                    executeScripts.cat()
                                } else if (params.get('s') === 'edit') {
                                    executeScripts.edit()
                                } else if (params.get('s') === 'geoverify') {
                                    executeScripts.geoverify()
                                } else if (params.get('s') === 'editimage') {
                                    executeScripts.editimage()
                                } else if (params.get('s') === 'preview') {
                                    executeScripts.preview()
                                }

                                sendResponse({success: true});
                            }
                        });
                    });
                } catch (error) {
                    console.error('Error:: ', error)
                    throw error
                }
                break
            }
        }
    }
);
