import m from 'mithril'
import io from 'socket.io-client'
import _ from 'lodash'

const socket = io('http://localhost:3000');

let Service = {
    action: '',
    msg: 'Ahoyi',
    buddies: 0,
    sender: '',
    requests: [],
    responds: [],
    data: [],
    sendEvent: function(action, data) {
        socket.emit(action, data)
    },
}

let Banana = {
    sum: function(args) {
        return _.sum(args)
    },
    max: function(args) {
        return _.max(args)
    },
    min: function(args) {
        return _.min(args)
    },
    multi: function(args) {
        return _.reduce(args, function(a, b) {
            return a * b
        })
    }
}
const Hello = {
    oninit: function() {
        socket.on('connect', () => {
            Service.sender = socket.id;
            m.redraw()
        });
        socket.on('dispatch', (data) => {
            try {
                var computed = Banana[data.action](data.data)
            } catch (e) {
                var computed = 'invalid function call in this client'
            }

            let result = {
                origin: data,
                sender: Service.sender,
                result: computed
            }
            Service.sendEvent('aggregate', result)
        })
        socket.on('result', (data) => {
            console.log(data)
            Service.responds.push(`from: ${data.origin.sender} action: ${data.origin.action} producer: ${data.sender} result: ${data.result}`)
        })
        socket.on('requestEcho', (data) => {
            Service.msg = data.msg
            Service.buddies = data.buddies
            m.redraw()
        })
    },
    view: function() {
        return m("main", [
            m('div.pure-g', [
                m('div.pure-u-1-3', [
                    m('h3', "client requests"),
                    m('ul', Service.requests.map((req) => {
                        return m('li', req)
                    }))
                ]),
                m('div.pure-u-1-3', [
                    m('h3', "client infomations"),
                    m('p', `sender: ${Service.sender}`),
                    m('p', `buddies: ${Service.buddies}`),
                    m('p', `messages: ${Service.msg}`),
                    m('h3', "client responds"),
                    m('ul', Service.responds.map((res) => {
                        return m('li', res)
                    }))
                ]),
                m('div.pure-u-1-3', [
                    m('h3', "client operations"),
                    m('div.pure-form.pure-form-aligned',
                        m('fieldset', [
                            m('legend', "some operations"),
                            m('div.pure-control-grou', [
                                m("input", {
                                    oninput: m.withAttr("value", function(value) {
                                        Service.action = value
                                    })
                                }),
                            ]),
                            m('div.pure-control-grou', [
                                m("input", {
                                    oninput: m.withAttr("value", function(value) {
                                        Service.data = _.map(value.split(','), function(item) {
                                            return parseInt(item)
                                        })
                                    })
                                }),
                            ]),

                            m("button", {
                                class: "pure-button pure-button-primary",
                                onclick: function() {
                                    Service.requests.push(`${Service.sender} request ${Service.action}`)
                                    Service.sendEvent('request', {
                                        action: Service.action,
                                        sender: Service.sender,
                                        data: Service.data
                                    })
                                }
                            }, "Request")
                        ])
                    )
                ])
            ])
        ])
    },
}

m.route(document.body, "/", {
    "/": Hello,
})