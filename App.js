// imports de sistema e dependências
import React from "react";
import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Card, Button } from "react-native-elements";

// imports de nossos arquivos
import animals from "./data";
import GlobalStyles from "./GlobalStyles";
import Swipe from "./Swipe";

// função principal, esse é o "programa" em si
export default class App extends React.Component {
  // variáveis que serão utilizadas
  state = {
    likedJobs: 0,
    passedJobs: 0,
  };

  // aumentar LIKED em 1
  handleLikedJob = () => {
    this.setState(({ likedJobs }) => ({
      likedJobs: likedJobs + 1,
    }));
  };

  // aumentar PASSED em 1
  handlePassedJob = () => {
    this.setState(({ passedJobs }) => ({
      passedJobs: passedJobs + 1,
    }));
  };

  // renderiza/cria um card quando existir
  renderCards(animal) {
    return (
      <Card>
        {/* imagem */}
        <View style={{ height: 300 }}>
          <Image
            //source={require("./assets/image1.jpg")}
            source={{
              uri:
                "https://picsum.photos/id/" + 42 * animal.animalId + "/800/600",
            }}
            style={{ width: "100%", height: "100%" }}
          />
        </View>

        {/* nome */}
        <Card.Title style={styles.title}>{animal.name}</Card.Title>

        {/* descrição */}
        <View style={styles.detailWrapper}>
          <Text>{animal.race}</Text>

          <Text numberOfLines={4}>
            {animal.snippet.replace(/<b>/g, "").replace(/<\/b>/g, "")}
          </Text>
        </View>
      </Card>
    );
  }

  // renderiza a tela de quando não há mais cards
  renderNoMoreCards = () => {
    return (
      <Card>
        <Card.Title>No More Cards</Card.Title>
        <Button
          title="Do something, Mutley"
          large
          icon={{ name: "my-location" }}
          backgroundColor="#03A9F4"
        />
      </Card>
    );
  };

  // este é o componente em si, a tela principal
  render() {
    return (
      // aqui é para adaptar ao Android e iPhone e não ficar encoberto
      <SafeAreaView>
        <View style={GlobalStyles.droidSafeArea}>
          {/* daqui pra baixo é o app */}
          {/* chama o placar */}
          <View style={styles.statusStyle}>
            <Text style={{ color: "red" }}>
              Passed: {this.state.passedJobs}
            </Text>
            <Text style={{ color: "blue" }}>Like: {this.state.likedJobs}</Text>
          </View>

          {/* chama o componente Swipe... */}
          <Swipe
            // ... falando o que acontece quando manda pra direita...
            onSwipeRight={this.handleLikedJob}
            // ... falando o que acontece quando manda pra esquerda...
            onSwipeLeft={this.handlePassedJob}
            // ... passando de onde vem os dados...
            data={animals}
            // ... ???? ...
            keyProp="animalId"
            // ... passando o que fazer quando há cards...
            renderCard={this.renderCards}
            // ... passando o que fazer quando não há cards...
            renderNoMoreCards={this.renderNoMoreCards}
          />
          {/* daqui para cima é o app */}
        </View>
      </SafeAreaView>
    );
  }
}

// estilos de formatação
const styles = StyleSheet.create({
  // espaço "global"
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // título do card
  title: {
    fontSize: 30,
  },

  // "placar" no topo
  statusStyle: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
