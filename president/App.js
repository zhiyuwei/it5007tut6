
import React, {Component} from 'react';
import { View,  StyleSheet, ScrollView } from 'react-native';
import RNApp from './RNApp';

export default class App extends Component {

  render(){
    return(
      <ScrollView style={styles.scroll}>
      <View style={styles.container}>
          <RNApp />
      </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    marginTop: 40,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
})


