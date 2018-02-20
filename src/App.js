import {Table, Grid, Button } from 'react-bootstrap';
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import web3 from './web3';
import ipfs from './ipfs';
import storehash from './storehash';

// ipfs.cat("QmXfz4jMCuYrU7rXAUE2KR9qfdn2uvEGHoBaqjxxHtKnyD", (err, result) => {
//   console.log(err, result);
// });

class App extends Component {
 
  state = {
    value: '',
    result: ' ', 
    txReceipt: '',
    ethAddress: '', 
    blockNumber:'',
    transactionHash:'',
    gasUsed:'' 
  };
 
  async componentDidMount() {

    console.log('componentDidMount');   
  }

  onSubmit = async (event) => {
    event.preventDefault();

    //bring in user's metamask account address
    const accounts = await web3.eth.getAccounts();
   
    console.log('Sending from Metamask account: ' + accounts[0]);

    //obtain contract address from storehash.js
    const ethAddress= await storehash.options.address;
    this.setState({ethAddress});

    //send the IPFS hash value to Ethereum w/ user's Metamask account
    await ipfs.add(this.state.value, (err, result) =>{
        console.log(err,result);

        // Set this.setState 'result' to value of function parameter result 
        this.setState({ result }); // es6 syntax 
        // this.setState({ result: result }); // long-form  

        // call a contract method and .send IPFS hash to etheruem contract 
        //return the transaction hash from the ethereum contract
        //see, this https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send
        storehash.methods.sendHash(this.state.result).send({
          from: accounts[0] 
      }, (error, transactionHash)=>{
          console.log(transactionHash);
          this.setState({transactionHash});
        });
    }) //await for ipfs.add
  }; //onSubmit end

  onClick = async () => {

    try{
     
      this.setState({blockNumber:"waiting.."});
      this.setState({gasUsed:"waiting..."});

      //get Transaction Receipt in console on click
      //See: https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt
      await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt)=>{
        console.log(err,txReceipt);
        this.setState({txReceipt});

      }); //await for getTransactionReceipt

      await this.setState({blockNumber: this.state.txReceipt.blockNumber});
      await this.setState({gasUsed: this.state.txReceipt.gasUsed});    
    } //try
    catch(error){
      console.log(error);
    }
  } //onClick
 
  render() {
    
    return (
      <div className="App">
        <header className="App-header">
          <h1>Simple Ethereum and IPFS with Create React App</h1>
        </header>
        
        <hr />
      <Grid>
        <form onSubmit={this.onSubmit}>
          <p> Data to send to IPFS </p>

            <input
              value = {this.state.value}
              onChange = {event => this.setState({value: event.target.value})}
            />
           
           <button> Send it </button>

         </form>

          <hr />

          <Button onClick = {this.onClick}> Get Transaction Receipt </Button>

            <Table bordered responsive>
            <thead>
              <tr>
                <th>Tx Receipt Category</th>
                <th>Values</th>
              </tr>
            </thead>
           
            <tbody>
               <tr>
                <td>Data Sent to IPFS</td>
                <td>{this.state.value}</td>
           
              </tr>

               <tr>
                <td>IPFS Hash # stored on Eth Contract</td>
                <td>{this.state.result}</td>
           
              </tr>
              <tr>
                <td>Ethereum Contract Address</td>
                <td>{this.state.ethAddress}</td>
              </tr>

              <tr>
                <td>Tx Hash # </td>
                <td>{this.state.transactionHash}</td>
              </tr>

              <tr>
                <td>Block Number # </td>
                <td>{this.state.blockNumber}</td>
              </tr>

              <tr>
                <td>Gas Used</td>
                <td>{this.state.gasUsed}</td>
              </tr>
          
            </tbody>
          </Table>
      </Grid>
   </div>
    );
  }
}

export default App;
