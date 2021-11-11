const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

const issues = []
function IssueRow(props)  {
    const issue=props.issue
    return (
        <tr>
            <td>{issue.id}</td>
            <td>{issue.name}</td>
            <td>{issue.phone}</td>
            <td>{issue.created.toTimeString()}</td>
        </tr>
    );
}

class DisplayHomepage extends React.Component {
    constructor() {
        super();
        this.homepageSubmit = this.homepageSubmit.bind(this);
    }
    homepageSubmit(e) {
        e.preventDefault();
        this.props.changeState('none')
        this.props.changeState2('none')
    }
    render(){
        return (
            <form name="homepage" onSubmit={this.homepageSubmit}>
                <button>Home Page</button>
            </form>
        );
    }
}

class AddCustomer extends React.Component {
    constructor() {
        super();
        this.handleClick = this.handleClick.bind(this);
        this.addSubmit = this.addSubmit.bind(this)
    }

    addSubmit(e) {
        e.preventDefault();
        const form=document.forms.issueAdd;
        if (form.cusName.value==''){alert("Name Ampty!")}
        else if (form.phoneNumber.value==''){alert("Phonenumber Ampty!")}
        else if (isNaN(form.phoneNumber.value)){alert("Please enter numbers!")}
        else{
        const issue = {
            name:form.cusName.value, phone:form.phoneNumber.value,
        }
        if (this.props.issues.length==25){alert("Waitlist is full")}
        else{
        this.props.createIssue(issue);
        form.cusName.value = ""; form.phoneNumber.value = "";
        alert("Successfully Adding!")
        }
        }
    }
    
    handleClick(e){
        e.preventDefault();
        this.props.changeState('block')
        this.props.changeState2('none')
    }
    render(){
        return (
            <div>
            <button onClick={this.handleClick}>Add New Customer</button>
            <form name="issueAdd" onSubmit={this.addSubmit} style={{display: this.props.display}}>
                Customer Name <input type='text' name='cusName' /><br />
                Phone Number <input type='text' name='phoneNumber' /><br />
                <button>Add</button>
            </form>
            </div>
        )
    }
}

class DeleteCustomer extends React.Component {
    constructor() {
        super();
        this.handleClick = this.handleClick.bind(this);
        this.delSubmit = this.delSubmit.bind(this)
    }

    delSubmit(e){
        e.preventDefault()
        const form=document.forms.issueDel;
        if (form.cusName.value==''){alert("Name Ampty!")}
        else if (form.phoneNumber.value==''){alert("Phonenumber Ampty!")}
        else if (isNaN(form.phoneNumber.value)){alert("Please enter numbers!")}
        else{
        const issue = {
            name:form.cusName.value, phone:form.phoneNumber.value,
        }
        const newIssueList = this.props.issues.slice();
        const theRemove = newIssueList.filter(item=>(item.phone==issue.phone && item.name==issue.name))
        if (this.props.issues.length==0){alert("No Customer To Remove")}
        else if(theRemove.length==0){alert("Customer not found!")}
        else{
        this.props.removeIssue(issue);
        form.cusName.value = ""; form.phoneNumber.value = "";
        alert("Successfully Removing!")
        }
        }

    }
    handleClick(e){
        e.preventDefault();
        this.props.changeState('none')
        this.props.changeState2('block')
    }

    render(){
        return (
            <div>
            <button onClick={this.handleClick}>Remove Customer</button>
            <form name="issueDel" onSubmit={this.delSubmit} style={{display: this.props.delform}}>
                Customer Name <input type='text' name='cusName' /><br />
                Phone Number <input type='text' name='phoneNumber' /><br />
                <button>Remove</button>
            </form>
            </div>
        )
    }
}

function DisplayCutomers(props) {
    
    const issueRows=props.issues.map(issue=>
    <IssueRow key={issue.id} issue={issue} />
    )
    return (
        <div><h2>Display Customers</h2><br/>
            <table>
                <thead>
                <tr>
                <th>Serial No.</th><th>Name</th><th>Phone Number</th><th>Timestamp</th>
                </tr>
                </thead>
                <tbody>
                    {issueRows}
                </tbody>
            </table>
        </div>
    )
    
}

function DisplayFreeSlots(props) {
    
    const slots=25-props.issues.length
    return (
        <div className="info">
        Free Slots Available: {slots}
        </div>
    )
    
}

async function graphQLFetch(query, variables = {}) {
    try {
      const response = await fetch('http://localhost:5000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ query, variables })
      });
      const body = await response.text();
      const result = JSON.parse(body, jsonDateReviver);
  
      if (result.errors) {
        const error = result.errors[0];
        if (error.extensions.code == 'BAD_USER_INPUT') {
          const details = error.extensions.exception.errors.join('\n ');
          alert(`${error.message}:\n ${details}`);
        } else {
          alert(`${error.extensions.code}: ${error.message}`);
        }
      }
      return result.data;
    } catch (e) {
      alert(`Error in sending data to server: ${e.message}`);
    }
  }

class ShowAll extends React.Component {
    constructor() {
    super();
    this.state = {issues: [], display: 'none', delform: 'none'};
    this.createIssue = this.createIssue.bind(this);
    this.removeIssue = this.removeIssue.bind(this);
    this.changeState = this.changeState.bind(this);
    this.changeState2 = this.changeState2.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        const query = `query {
          issueList {
            id name phone created
          }
        }`;
    
        const data = await graphQLFetch(query);
        if (data) {
            this.setState({ issues: data.issueList });
    }
      }

    async createIssue(issue) {
        const query = `mutation issueAdd($issue: IssueInputs!) {
            issueAdd(issue: $issue) {
              id
            }
          }`;
      
        const data = await graphQLFetch(query, { issue });
        if (data) {
        this.loadData();
        }
    }

    async removeIssue(issue){
        const query = `mutation issueRemove($issue: IssueRemove!) {
            issueRemove(issue: $issue) {
              id
            }
          }`;
      
        const data = await graphQLFetch(query, { issue });
        if (data) {
        this.loadData();
        }
        
    }
    changeState(somevalue){
        this.setState({display: somevalue});
    }
    changeState2(somevalue){
        this.setState({delform: somevalue});
    }
    render(){
        return (
            <React.Fragment>
            <DisplayHomepage issues={this.state.issues} display={this.state.display} 
            delform={this.state.delform} changeState={this.changeState} 
            changeState2={this.changeState2}/>
            <DisplayFreeSlots issues={this.state.issues} />
            <hr />
            <AddCustomer issues={this.state.issues} createIssue={this.createIssue} display={this.state.display} 
            changeState={this.changeState} changeState2={this.changeState2}/>
            <hr />
            <DeleteCustomer issues={this.state.issues} removeIssue={this.removeIssue} delform={this.state.delform} 
            changeState={this.changeState} changeState2={this.changeState2} />
            <hr />
            <DisplayCutomers issues={this.state.issues} />
            
            </React.Fragment>
        )
    }
}

const element=<ShowAll />
ReactDOM.render(element, document.getElementById('contents'))