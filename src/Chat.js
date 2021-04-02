import React from 'react';
import { Client } from '@stomp/stompjs';

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
    this.addMessage = this.addMessage.bind(this);
    // this.onBtnClick = this.onBtnClick.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.setConnected = this.setConnected.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleSubmitConnect = this.handleSubmitConnect.bind(this);
    this.handleSubmitSendMessage = this.handleSubmitSendMessage.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
  }

  getDefaultState() {
    return {
      socket: new Client({
        brokerURL: 'ws://' + window.location.hostname + ':8080/chat',
        onConnect: _ => {
          this.state.socket.subscribe("/topic/messages", m => this.addMessage(JSON.parse(m.body)));
          this.setConnected(true);
        },
        onDisconnect: _ => {
          console.log("Se desconectó");
          this.setConnected(false);
        }
      }),
      messages: [],
      connected: false,
      name: "",
      message: "",
    };
  }

  addMessage(message) {
    this.setState((state, _) => ({
      ...state,
      messages: [...state.messages, message]
    }));
  }

  sendMessage(message) {
    try {
      this.state.socket.publish({
        destination: "/app/chat",
        body: JSON.stringify(message)
      })
    } catch (error) {
      console.log(error);
    }

  }

  connect() {
    try {
      this.state.socket.activate();
    } catch (error) {
      console.log(error);
    }
  }

  disconnect() {
    try {
      this.state.socket.deactivate();
      this.setState((state) => ({
        ...state,
        message: ""
      }));
    } catch (error) {
      console.log(error);
    }
  }

  setConnected(value) {
    this.setState((state, _) => ({
      ...state,
      connected: value
    }));
  }

  handleNameChange(ev) {
    this.setState((state, _) => ({
      ...state,
      name: ev.target.value
    }))
  }
  
  handleMessageChange(ev) {
    this.setState((state, _) => ({
      ...state,
      message: ev.target.value
    }))
  }
  
  handleSubmitConnect(ev) {
    ev.preventDefault();
    if (!this.state.connected) {
      this.connect();
    } else {
      this.disconnect();
    }
  }

  handleSubmitSendMessage(ev) {
    ev.preventDefault();
    const message = {
      from: this.state.name,
      text: this.state.message
    }
    this.sendMessage(message);
  }

  render() {
    return (
      <>
        <form onSubmit={this.handleSubmitConnect}>
          <label>
            Nombre
          </label>
          <input type="text" disabled={this.state.connected} value={this.state.name} onChange={this.handleNameChange}/>
          <input type="submit" disabled={!this.state.name} value={this.state.connected ? "Desconectar" : "Conectar"} />
        </form>
        <form onSubmit={this.handleSubmitSendMessage}>
          <textarea disabled={!this.state.connected} value={this.state.message} onChange={this.handleMessageChange} />
          <br />
          <input type="submit" value="Enviar" disabled={!this.state.connected || !this.state.message} />
        </form>
        <ul>
          {this.state.messages.map((m, i) => (<li key={i}><b>[{m.from}]:</b> {m.text}</li>))}
        </ul>
      </>
    )
  }
}
