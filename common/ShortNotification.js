function notify(message, timeout) {
    const remove = () => {
        document.querySelector("#sighery-custom-notif").remove();
        document.querySelector("#sighery-custom-notif-style").remove();
    }

    let notif = stringToNode(
        `<div id="sighery-custom-notif">
            <div class="sighery-custom-notif-text">${message}</div>
            <button class="sighery-custom-notif-close">X</button>
        </div>`
    );

    let css = `
        #sighery-custom-notif {
          background-color: #5959CD;
          color: #FFFFFF;
          position: fixed;
          bottom: 20px;
          right: 20px;
          display: flex;
          z-index: 999;
        }

    `;
    let style = stringToNode(`<style type="text/css" id="sighery-custom-notif-style">${css}</style>`);

    console.log(notif);
    console.log(style);

    document.head.appendChild(style);
    document.body.appendChild(notif);

    document.querySelector(".sighery-custom-notif-close").addEventListener("click", remove)

    if (timeout > 0) {
        setTimeout(remove, timeout)
    }
}

function stringToNode(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    console.log(template);
    return template.content.firstChild;
};
