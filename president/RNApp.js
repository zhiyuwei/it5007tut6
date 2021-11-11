import React, { Component } from 'react'
import { View, Text, Button, TextInput, StyleSheet } from 'react-native'
import { ApolloClient, HttpLink, InMemoryCache  } from 'apollo-boost'
import { ApolloProvider, graphql, Mutation } from 'react-apollo';
import gql from 'graphql-tag'

const client = new ApolloClient({
    link: new HttpLink({
      uri:'http://10.20.7.119:5000/graphql'
    }),
    cache: new InMemoryCache(),
  })

const addissue = gql`mutation issueAdd($issue: IssueInputs!) {
    issueAdd(issue: $issue) {
      id
    }
  }`;

const customerquery = gql`query {
    issueList {
      id name phone created
    }
  }`;

export class RNApp extends Component {
  constructor() {
    super()
    this.state = {
      name: '',
      phone:''
    }
    
  }
  
  render () {
    return (
    <ApolloProvider client={client}>
      <View style={styles.container}>
        <Mutation mutation={addissue} refetchQueries={[{ query: customerquery }]}>
        {(addMutation, { data }) => (
              <View>
                <Text style={styles.welcome}>Add new customer:</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => this.setState({ name: text })}
                  value={this.state.name}
                  placeholder="name"
                />
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => this.setState({ phone: text })}
                  value={this.state.phone}
                  placeholder="phone"
                />
                <Button
                  onPress={() => {
                    const issue={name:this.state.name, phone:this.state.phone}
                    addMutation({
                      variables: {
                        issue:issue
                      },
                    })
                      .then((res) => res)
                      .catch((err) => <Text>{err}</Text>)
                    this.setState({ phone: '', name: '' })
                  }}
                  title="Add customer"
                />
              </View>
            )}
        </Mutation>
      </View>
    </ApolloProvider>
    )
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5FCFF',
    },
    welcome: {
      fontSize: 20,
      textAlign: 'center',
      margin: 10,
    },
    input: {
      height: 30,
      width: 150,
      borderColor: 'gray',
      borderWidth: 1,
      marginTop: 5,
      padding: 1,
    },
  })

  export default RNApp