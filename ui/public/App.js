const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

const issues = [];

function IssueRow(props) {
  const issue = props.issue;
  return /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, issue.id), /*#__PURE__*/React.createElement("td", null, issue.name), /*#__PURE__*/React.createElement("td", null, issue.phone), /*#__PURE__*/React.createElement("td", null, issue.created.toTimeString()));
}

class DisplayHomepage extends React.Component {
  constructor() {
    super();
    this.homepageSubmit = this.homepageSubmit.bind(this);
  }

  homepageSubmit(e) {
    e.preventDefault();
    this.props.changeState('none');
    this.props.changeState2('none');
  }

  render() {
    return /*#__PURE__*/React.createElement("form", {
      name: "homepage",
      onSubmit: this.homepageSubmit
    }, /*#__PURE__*/React.createElement("button", null, "Home Page"));
  }

}

class AddCustomer extends React.Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.addSubmit = this.addSubmit.bind(this);
  }

  addSubmit(e) {
    e.preventDefault();
    const form = document.forms.issueAdd;

    if (form.cusName.value == '') {
      alert("Name Ampty!");
    } else if (form.phoneNumber.value == '') {
      alert("Phonenumber Ampty!");
    } else if (isNaN(form.phoneNumber.value)) {
      alert("Please enter numbers!");
    } else {
      const issue = {
        name: form.cusName.value,
        phone: form.phoneNumber.value
      };

      if (this.props.issues.length == 25) {
        alert("Waitlist is full");
      } else {
        this.props.createIssue(issue);
        form.cusName.value = "";
        form.phoneNumber.value = "";
        alert("Successfully Adding!");
      }
    }
  }

  handleClick(e) {
    e.preventDefault();
    this.props.changeState('block');
    this.props.changeState2('none');
  }

  render() {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
      onClick: this.handleClick
    }, "Add New Customer"), /*#__PURE__*/React.createElement("form", {
      name: "issueAdd",
      onSubmit: this.addSubmit,
      style: {
        display: this.props.display
      }
    }, "Customer Name ", /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "cusName"
    }), /*#__PURE__*/React.createElement("br", null), "Phone Number ", /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "phoneNumber"
    }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("button", null, "Add")));
  }

}

class DeleteCustomer extends React.Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.delSubmit = this.delSubmit.bind(this);
  }

  delSubmit(e) {
    e.preventDefault();
    const form = document.forms.issueDel;

    if (form.cusName.value == '') {
      alert("Name Ampty!");
    } else if (form.phoneNumber.value == '') {
      alert("Phonenumber Ampty!");
    } else if (isNaN(form.phoneNumber.value)) {
      alert("Please enter numbers!");
    } else {
      const issue = {
        name: form.cusName.value,
        phone: form.phoneNumber.value
      };
      const newIssueList = this.props.issues.slice();
      const theRemove = newIssueList.filter(item => item.phone == issue.phone && item.name == issue.name);

      if (this.props.issues.length == 0) {
        alert("No Customer To Remove");
      } else if (theRemove.length == 0) {
        alert("Customer not found!");
      } else {
        this.props.removeIssue(issue);
        form.cusName.value = "";
        form.phoneNumber.value = "";
        alert("Successfully Removing!");
      }
    }
  }

  handleClick(e) {
    e.preventDefault();
    this.props.changeState('none');
    this.props.changeState2('block');
  }

  render() {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
      onClick: this.handleClick
    }, "Remove Customer"), /*#__PURE__*/React.createElement("form", {
      name: "issueDel",
      onSubmit: this.delSubmit,
      style: {
        display: this.props.delform
      }
    }, "Customer Name ", /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "cusName"
    }), /*#__PURE__*/React.createElement("br", null), "Phone Number ", /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "phoneNumber"
    }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("button", null, "Remove")));
  }

}

function DisplayCutomers(props) {
  const issueRows = props.issues.map(issue => /*#__PURE__*/React.createElement(IssueRow, {
    key: issue.id,
    issue: issue
  }));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, "Display Customers"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Serial No."), /*#__PURE__*/React.createElement("th", null, "Name"), /*#__PURE__*/React.createElement("th", null, "Phone Number"), /*#__PURE__*/React.createElement("th", null, "Timestamp"))), /*#__PURE__*/React.createElement("tbody", null, issueRows)));
}

function DisplayFreeSlots(props) {
  const slots = 25 - props.issues.length;
  return /*#__PURE__*/React.createElement("div", {
    className: "info"
  }, "Free Slots Available: ", slots);
}

async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('http://localhost:5000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables
      })
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
    this.state = {
      issues: [],
      display: 'none',
      delform: 'none'
    };
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
      this.setState({
        issues: data.issueList
      });
    }
  }

  async createIssue(issue) {
    const query = `mutation issueAdd($issue: IssueInputs!) {
            issueAdd(issue: $issue) {
              id
            }
          }`;
    const data = await graphQLFetch(query, {
      issue
    });

    if (data) {
      this.loadData();
    }
  }

  async removeIssue(issue) {
    const query = `mutation issueRemove($issue: IssueRemove!) {
            issueRemove(issue: $issue) {
              id
            }
          }`;
    const data = await graphQLFetch(query, {
      issue
    });

    if (data) {
      this.loadData();
    }
  }

  changeState(somevalue) {
    this.setState({
      display: somevalue
    });
  }

  changeState2(somevalue) {
    this.setState({
      delform: somevalue
    });
  }

  render() {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DisplayHomepage, {
      issues: this.state.issues,
      display: this.state.display,
      delform: this.state.delform,
      changeState: this.changeState,
      changeState2: this.changeState2
    }), /*#__PURE__*/React.createElement(DisplayFreeSlots, {
      issues: this.state.issues
    }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(AddCustomer, {
      issues: this.state.issues,
      createIssue: this.createIssue,
      display: this.state.display,
      changeState: this.changeState,
      changeState2: this.changeState2
    }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(DeleteCustomer, {
      issues: this.state.issues,
      removeIssue: this.removeIssue,
      delform: this.state.delform,
      changeState: this.changeState,
      changeState2: this.changeState2
    }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(DisplayCutomers, {
      issues: this.state.issues
    }));
  }

}

const element = /*#__PURE__*/React.createElement(ShowAll, null);
ReactDOM.render(element, document.getElementById('contents'));