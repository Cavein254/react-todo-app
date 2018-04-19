import React, { Component } from 'react';
import UUID from 'uuid-js';

const TodoTitle = () => {
	return <div className="d-flex justify-content-center display-1">ToDo</div>
}

class TodoForm extends Component {
	constructor(props) {
		super(props);
		this.state = {inputNode: null};
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	render() {
		return (
			<form onSubmit={this.handleSubmit}>
				<input className="form-control" ref={(input) => this.state.inputNode = input} placeholder="Add Todo's ..." />
			</form>
		)
	}

	handleSubmit(e) {
		e.preventDefault();
		this.props.addTodo(this.state.inputNode.value);
		this.state.inputNode.value = '';
	}
}


class Todo extends Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	render() {
		let todoText = this.props.item.checked ? <s>{this.props.item.text}</s>:this.props.item.text;
		let bgColor = this.props.item.checked ? "bg-warning":"bg-warning";
		return (
			<li className={"list-group-item d-flex align-items-center justify-content-between " + bgColor}>
					<div>
						<input type="checkbox" checked={this.props.item.checked} onChange={this.handleChange}/>
						&nbsp;
						{todoText}
					</div>
					<div>&nbsp;</div>
					<span className="badge badge-danger badge-pill" onClick={() => {this.props.removeTodo(this.props.item.id)}}>
						x
					</span>
			</li>
		)
	}

	handleChange(e) {
		this.props.checkTodo({text: this.props.item.text, checked: e.target.checked, id: this.props.item.id});
	}
}

const TodoList = ({data, checkTodo, removeTodo}) => {
	const todoItem = data.map((item) => {
			return <Todo key={item.id} item={item} checkTodo={checkTodo} removeTodo={removeTodo} />
		})
	return (
		<ul className="list-group">
			{todoItem}
		</ul>
	)
}

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
		.then((response) => {
			return response.json();
		})
		.then((jsonResponse) => {
			this.setState({data: jsonResponse["data"]});
		});
	}

	addTodo(todoText) {
		let d = {"text": todoText, "id": UUID.create().toString(), "checked": false};
		fetch("/todo", {
			method: "post",
			body: JSON.stringify(d),
			headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
			}
		})
		.then(() => console.log(`Added Todo with Text: ${todoText} and id: ${d.id}`));
		this.state.data.push(d);
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
		console.log(todo.id)
		//this.state.data =
		this.setState({data: this.state.data.map((item) => item.id === todo.id ? todo : item)});
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
		this.setState(
			{
				data: this.state.data.filter((item) => { return item.id !== todoId} )
			}
		);
	}

	render() {
		return (
			<div>
				<TodoTitle />
				<TodoForm addTodo={this.addTodo.bind(this)} / >
				<TodoList data={this.state.data} checkTodo={this.checkTodo.bind(this)} removeTodo={this.removeTodo.bind(this)} />
			</div>
		)
	}
}

export default TodoApp;
