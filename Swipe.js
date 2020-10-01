// imports de sistema e dependências
import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  UIManager,
  LayoutAnimation,
} from "react-native";

// imports de nossos arquivos

// constantes que serão utilizadas
// largura da tela
const SCREEN_WIDTH = Dimensions.get("window").width;
// tolerância do swipe (contando a partir do meio, para ambos os lados)
const SWIPE_THRESHOLD = 0.4 * SCREEN_WIDTH;
// tempo da animação de swipe
const SWIPE_OUT_DURATION = 250;

// este é o programa em si, que, no caso, é um componente a ser chamado no programa em si App.js
class Swipe extends Component {
  // variáveis que serão utilizadas caso não seja passado um prop/parâmetro
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {},
    keyProp: "id",
  };

  // é um construtor... não sei direito de quê, acho que ele faz a carta como objeto manejável
  constructor(props) {
    // o "super()" em um construtor permite acessar a classe pai... não entendi porque está aqui, mas precisa dele
    super(props);
    // a posição deste objeto será rastreada em X e Y...
    this.position = new Animated.ValueXY();
    // ... o que é permitido pela biblioteca PANRESPONDER
    this._panResponder = PanResponder.create({
      // este método confirma se vai ser rastreado
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      // este método atualiza conforme há movimento
      onPanResponderMove: (evt, gestureState) => {
        // posição atual é gestureState.move{X,Y}...
        // nova posição é gestureState.d{x,y}...
        // atualiza em POSITION, que é a posição atual do card enquanto arrastado
        this.position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      // este método chama quando se tira libera um objeto rastreado
      onPanResponderRelease: (evt, gestureState) => {
        // se o movimento lateral for maior do que a tolerância...
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // ... chama o método com um valor referente...
          this.forceSwipe("right");
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe("left");
        } else {
          // ... se não, volta pra posição inicial do card
          this.resetPosition();
        }
      },
    });
    // ???
    this.state = { index: 0 };
  }

  // capta que o card passou da tolerância e força a rotação dela para sair da tela
  // como funciona o ANIMATED é explicado no próximo método
  forceSwipe(direction) {
    // se o parâmetro foi "RIGHT", vai usar a largura da tela positivo... se não, negativo
    const x = direction === "right" ? SCREEN_WIDTH * 1.1 : -SCREEN_WIDTH * 1.1;
    // anima o card indo fora da tela
    Animated.timing(this.position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
    }).start(() => this.onSwipeComplete(direction));
    // na linha de cima, depois de realizar a animação, ele roda a próxima função, repassando a direção como parâmetro
  }

  // reseta o card pra posição inicial dele
  resetPosition() {
    // o ANIMATED recebe o que acontece na animação e termina com "start()", que é o que chama o que foi definido
    Animated.spring(this.position, {
      toValue: { x: 0, y: 0 },
    }).start();
  }

  // acontece depois que o card foi jogado pra fora
  onSwipeComplete(direction) {
    // recebe como constantes os valores referentes passados quando o componente foi chamado...
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    // ... e um deles vai ser transformado em arranjo
    const item = data[this.state.index];

    // confere para qual direção foi e pega um dos parâmetros (que foi um método)
    direction === "right" ? onSwipeRight(item) : onSwipeLeft(item);
    this.position.setValue({ x: 0, y: 0 });

    /*
    // supostamente, este trecho ia fazer com que houvesse uma transição bonitinha, mas tá travando no Android...
    // então a gente empilha tudo ao invés de necessitar de movimento e ignora essa parte

    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring();
    */

    this.setState({ index: this.state.index + 1 });
  }

  // método que atualiza tudo caso tenha alguma alteração nos parâmetros do componente
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.data !== this.props.data) {
      this.setState({
        index: 0,
      });
    }
  }

  // ???
  getCardStyle() {
    const { position } = this;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ["-120deg", "0deg", "120deg"],
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  }

  // função para renderizar os cards
  renderCards = () => {
    // se estiver buscando o card além da fila (ou seja, sem cards), retorna que acabou (do parâmetro)
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }

    // se tiver card, vê o que vai fazer...
    return (
      this.props.data
        // mapeia um arranjo com o parâmetro enviado
        .map((item, i) => {
          if (i < this.state.index) {
            return null;
          }

          if (i === this.state.index) {
            return (
              // essa tag "ANIMATED.VIEW" indica que o objeto pode receber animações
              <Animated.View
                key={item[this.props.keyProp]}
                style={[this.getCardStyle(), styles.cardStyle]}
                {...this._panResponder.panHandlers}
              >
                {this.props.renderCard(item)}
              </Animated.View>
            );
          }

          // retorna e empilha
          return (
            <View
              key={item[this.props.keyProp]}
              style={[
                styles.cardStyle,
                // a linha de baixo é para empilhar torto (com números maiores que 0)
                { top: 0 * (i - this.state.index), zIndex: 5 },
              ]}
            >
              {this.props.renderCard(item)}
            </View>
          );
        })
        // esta linha é para mostrar DO PRIMEIRO AO ÚLTIMO, pois é só o primeiro da lista que é interagível
        .reverse()
    );
  };

  // o que REALMENTE sai desta porção de código
  render() {
    return <View>{this.renderCards()}</View>;
  }
}

// estilos de formatação
const styles = {
  // corpo do card
  detailWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },

  // tamanho horizontal do card
  cardStyle: {
    position: "absolute",
    width: SCREEN_WIDTH,
  },
};

// como o arquivo é referenciado nos outros
export default Swipe;
