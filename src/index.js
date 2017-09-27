import m from 'mithril'
import io from 'socket.io-client'
const socket = io('http://localhost:3000');

let Service = {
    list: [1, 2, 3],
    name: 'Hello From Native',
    sendEvent: function(action, data) {
        socket.emit(action, data)
    }
}

const Hello = {
    oninit: function() {
        socket.on('testEcho', function(data) {
            Service.name = data
            m.redraw()
        })
    },
    view: function() {
        return m("main", [
            m("h1", {
                class: "title"
            }, Service.name),
            m("ul", Service.list.map(function(item) {
                return m("li", item)
            })),
            m("button", {
                onclick: function() {
                    Service.sendEvent('test', {
                        action: 'a',
                        data: [1, 2, 3]
                    })
                }
            }, "Button"),
        ])
    },

}

m.route(document.body, "/", {
    "/": Hello,
})