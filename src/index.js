import m from 'mithril'
import io from 'socket.io-client'
const socket = io('http://localhost:3000');

let Service = {
    action: '',
    msg: 'Ahoyi',
    buddies: 0,
    sender: '',
    sendEvent: function(action, data) {
        socket.emit(action, data)
    },
}

const Hello = {
    oninit: function() {
        socket.on('connect', () => {
            Service.sender = socket.id;
            m.redraw()
        });
        socket.on('dispatch', (data) => {
            let result = {
                origin: data,
                result: 1,
                sender: Service.sender
            }
            Service.sendEvent('aggregate', result)
        })
        socket.on('result', (data) => {
            console.log(data)
        })
        socket.on('requestEcho', (data) => {
            Service.msg = data.msg
            Service.buddies = data.buddies
            m.redraw()
        })
    },
    view: function() {
        return m("main", [
            // m("div", [
            //     m('span', `buddies: ${Service.buddies} ${Service.sender}: `),
            //     m('span', Service.msg)
            // ]),
            // m("input", {
            //     oninput: m.withAttr("value", function(value) {
            //         Service.action = value
            //     })
            // }),
            // m("button", {
            //     onclick: function() {
            //         Service.sendEvent('request', {
            //             action: Service.action,
            //             sender: Service.sender,
            //             data: {}
            //         })
            //     }
            // }, "Button")
        ])
    },
}

m.route(document.body, "/", {
    "/": Hello,
})