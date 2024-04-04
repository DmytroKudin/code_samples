import {delay} from "../../helpers/index.js";
import {HandleError} from "../../helpers/handleError.js";

export const clServices = {
    toggleCheckbox: async function (page, selector, checked) {
        const input = await page.$(`input[name="${selector}"]`);
        if (!input) throw new HandleError(`Input checkbox with selector ${selector} not found`);

        const currentValue = await input.evaluate((node) => node.checked);
        if (currentValue !== checked) {
            await input.click();
        }
        return page;
    },
    fillField: async function (page, labelName, value) {
        try {
            const label = await page.evaluateHandle((labelName) => {
                const span = Array.from(document.querySelectorAll('label span.label')).find((s) => s.innerText === labelName);
                if (!span) throw new HandleError(`Label with text "${labelName}" not found`);
                return span.closest('label');
            }, labelName);
            const select = await label.$('select')
            const input = await label.$('input');
            const textarea = await label.$('textarea');
            if (textarea) {
                await page.evaluate((textarea, value) => textarea.value = value, textarea, value);
            } else if (input) {
                await page.evaluate((input, value) => input.value = value, input, value);
            } else if (select) {
                const selectId = await select.evaluate((el) => el.getAttribute('id'));
                if (!selectId) throw new HandleError('Select id not found');
                await page.waitForSelector(`#${selectId}-button`)
                const btn = await page.$(`#${selectId}-button`)
                if (!btn) throw new HandleError('Select not found')
                await btn.click()
                await page.waitForSelector(`ul#${selectId}-menu`);
                const ul = await page.$(`ul#${selectId}-menu`);
                if (!ul) throw new HandleError(`Ul with id ui-id-1 not found`);
                const liList = await ul.$$('li');
                let liId = ''
                for await (let li of liList) {
                    const text = await li.getProperty('textContent').then(t => t.jsonValue());
                    const id = await li.getProperty('id').then(t => t.jsonValue());
                    if (text === value) liId = id
                }
                if (!liId) throw new HandleError(`Li "${value}" not found`)
                await page.waitForSelector(`#${liId}`);
                const element = await page.$(`#${liId}`);
                if (!element) throw new HandleError(`Element "#${liId}" not found`);
                const box = await element.boundingBox();
                if (!box) throw new HandleError(`Element "#${liId}" is not visible`);
                await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await page.mouse.down();
                await page.mouse.up();
            }
            await delay(500)
            return page
        } catch (err) {
            console.log('Error in fillField ', err)
            return null
        }
    },
}