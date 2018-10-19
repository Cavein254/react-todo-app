import React, { Component } from 'react';
import UUID from 'uuid-js';

const TodoTitle = ({count}) => {
	return <div  className="d-flex justify-content-center align-items-center display-1">ToDo</div>
}

class TodoForm extends Component {
	constructor(props) {
		super(props);
		this.inputNode = React.createRef();
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		this.inputNode.current.focus();
	}

	handleSubmit(e) {
		e.preventDefault();
		this.props.addTodo(this.inputNode.current.value);
		this.inputNode.current.value = '';
	}

	render() {
		return (
			<form onSubmit={this.handleSubmit}>
				<input className="form-control" ref={this.inputNode} placeholder="Add Todo's "/>
			</form>
		)
	}
}

class Todo extends Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
		this.props.checkTodo({text: this.props.item.text, checked: e.target.checked, id: this.props.item.id});
	}

	render() {
		let todoText = this.props.item.checked ? <s>{this.props.item.text}</s>:this.props.item.text;
		return (
			<li className="list-group-item d-flex justify-content-between align-items-center bg-warning">
					<div className="d-flex align-items-center">
						<input type="checkbox" checked={this.props.item.checked} onChange={this.handleChange}/>
						<div className="ml-1">{todoText}</div>
					</div>
					<span className="close ml-1" onClick={() => this.props.removeTodo(this.props.item.id)}>&times;</span>
			</li>
		)
	}
}

const TodoList = ({data, checkTodo, removeTodo}) => (
		<ul className="list-group">
			{data.map(item => <Todo key={item.id} item={item} checkTodo={checkTodo} removeTodo={removeTodo}/>)}
		</ul>
	)

class TodoApp extends Component {
	constructor(props) {
		super(props);
		//{ data: [{"text": "randtext", "id": UUID.create().toString(), "checked": false}] }
		this.state = {data: []};
		this.initialize = this.initialize.bind(this);
	}

	componentDidMount() {
		this.initialize()
	}

	initialize() {
		fetch("/todo")
		.then(response => response.json())
		.then(jsonResponse => this.setState({data: jsonResponse["data"]}));
	}

	addTodo(todoText) {
		const todo = {"text": todoText, "id": UUID.create().toString(), "checked": false};
		fetch("/todo", {
			method: "post",
			body: JSON.stringify(todo),
			headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
			}
		})
		.then(() => console.log(`Added Todo with Text: ${todoText} and id: ${todo.id}`));
		this.state.data.push(todo);
		this.setState({data: this.state.data});
	}

	checkTodo(todo) {
		fetch("/todo", {
			method: "put",
			body: JSON.stringify(todo),
			headers: {
				'Accept': 'application/json, text/plain, */*',
				'Content-Type': 'application/json'
			}
		})
		.then(() => console.log(`Checked Todo with text: ${todo.text}`));
		this.setState({data: this.state.data.map(item => item.id === todo.id ? todo : item)});
	}

	removeTodo(todoId) {
		fetch("/todo", {
			method: "delete",
			body: JSON.stringify({"id": todoId}),
			headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
			}
		})
		.then(() => console.log(`Deleted Todo with id: ${todoId}`));
		this.setState({data: this.state.data.filter(item => item.id !== todoId)});
	}

	render() {
		return (
			<div>
				<TodoTitle/>
				<TodoForm addTodo={this.addTodo.bind(this)}/>
				<TodoList data={this.state.data} checkTodo={this.checkTodo.bind(this)} removeTodo={this.removeTodo.bind(this)}/>
			</div>
		)
	}
}

export default TodoApp;
