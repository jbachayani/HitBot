import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Bubble from './bubble';
import Suggestions from '../Suggestions';
import { requestServer } from '../../../BotAPI';
import Input from './Input';
import './style.css';

import axios from 'axios';

class Chat extends Component {

  static propTypes = {
      onSearch: PropTypes.func.isRequired,
   };

  state = {
      message: null,
      messages: [],
      userMessage: "",
  }

  getTextArea = (text) => {
      this.setState({userMessage: text});
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  addSecondBubble = () => {
    const { messages } = this.state;
    const newMessage = {content: "J'ai pris un peu d'avance en vous affichant la page artiste de Michael Jackson !", type: "bot", key: messages.length}
    messages.push(newMessage)
    this.setState({messages})
  }

  componentDidMount() {
    setTimeout(() => {this.addSecondBubble()}, 1000);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.userMessage) {
      const { userMessage, messages } = this.state;
      const { onSearch } = this.props;
      let newMessage = {content: userMessage, type: "user", key: messages.length}
      messages.push(newMessage)
      this.setState({messages, userMessage: ''})

      let request = requestServer(userMessage, (response) => {

        const action = response.result.action;
        console.log(response);

        if (action === "action.music.search.artist" && response.result.parameters.title) {
            const artist = onSearch('artist', response.result.parameters.title);
            const messageContent = 'Cette chanson est interprétée par ' + artist.name+'.';

            newMessage = {content: messageContent, type: "bot", key: messages.length}
            messages.push(newMessage)
            this.setState({messages})

        } else if (action === "action.music.infos.artist" && response.result.parameters.artist) {
            const artist = onSearch('artist', response.result.parameters.artist);
            const messageContent = artist.name+' est un artiste. Regardez à droite, je vous ai mis sa biographie !';

            newMessage = {content: messageContent, type: "bot", key: messages.length}
            messages.push(newMessage)
            this.setState({messages})
        } else if (action === "action.artist.songs" && response.result.parameters.artist) {
            const songs = onSearch('songs', response.result.parameters.artist);
            let messageContent = 'Voici quelques chansons de ' + songs[0].artist + ' : ';
            songs.map(song => {
              messageContent += song.title;
              messageContent += ', ';
            })

            newMessage = {content: messageContent, type: "bot", key: messages.length}
            messages.push(newMessage)
            this.setState({messages})
        } else {
          newMessage = {content: response.result.fulfillment.speech, type: "bot", key: messages.length}
          messages.push(newMessage)
          this.setState({messages})
        }

      });
    } else {
      return false;
    }
  }

  render() {

      const { messages, userMessage } = this.state;

    return (
      <div className="Content" ref={(el) => { this.messagesEnd = el; }}>
        <section className='userSec'>
          <div className='active'>
            <img src="/picto.png"/>
          </div>
          <Bubble type='bot' text='Bienvenue sur Hit ! Posez moi des questions sur vos artistes favoris !' />
        </section>
          {messages.length > 0 &&
            messages.map( msg => {
              return(
                <section key={msg.key} className='userSec'>
                  <div className={ msg.type === 'user' ? 'hidden' : 'active' }>
                    <img src="/picto.png"/>
                  </div>
                  <div className={ msg.type === 'user' ? 'active userCase' : 'hidden' }>
                    <i className="fa fa-user"></i>
                  </div>
                  <Bubble type={msg.type} text={msg.content} />
                </section>
              );
            })
          }
        {/*}<Suggestions />*/}
        <form className='chatUser' onSubmit={this.handleSubmit}>
            <Input value={userMessage} getTextArea={this.getTextArea}/>
            <input type='submit' value='Envoyer'/>
            <button><i className="fa fa-microphone"></i></button>
        </form>
      </div>
    );
  }
}

export default Chat;
