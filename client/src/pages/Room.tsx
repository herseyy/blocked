import { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios"
import styles from "../static/room.module.css";

import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import {indentWithTab} from "@codemirror/commands";
import { basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";

import { useSocket } from '../socket';

function Room({ user, role }) {
	const socket = useSocket();

	const location = useLocation();
	const editorRef = useRef<HTMLDivElement | null>(null);
	const viewerRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLTextareaElement | null>(null);
	const viewRef = useRef<EditorView | null>(null);
	const viewerViewRef = useRef<EditorView | null>(null);
	const roomId = location.state.roomId

	const [result, setResult] = useState();
	const [selectedProblem, setSelectedProblem] = useState('');
	const [problems, setProblems] = useState({});
	const [submissions, setSubmissions] = useState([]);
	const [submitted, setSubmitted] = useState([]);
	const [status, setStatus] = useState([]);


	useEffect(() => {
		socket.on('roomMessage', (data) => {
	  		console.log(`${data.userId} joined room ${data.roomId}: ${data.message}`);

	  		if (role == "admin" && data.userId != user.uid) {
	  			console.log("ADDD PLAYER")
	  			// add player to db
	  			axios.post("http://localhost:3000/api/rooms/addPlayer", {
	  				roomId: data.roomId,
	  				userId: data.userId
	  			})
	  		}
		});

		return () => {
		  socket.off('roomMessage');
		};
	}, [socket]);

	useEffect(() => {
		if (!editorRef.current) return;

		const state = EditorState.create({
			doc: "",
			extensions: [
				basicSetup,
				keymap.of([indentWithTab]),
				python()
			]
		});

		const view = new EditorView({
			state,
			parent: editorRef.current
		})

		viewRef.current = view;
    	return () => view.destroy();
	}, [])

	useEffect(() => {
		if (!viewerRef.current) return;

		const state = EditorState.create({
			doc: "",  // Initial empty state
			extensions: [
				basicSetup,
				keymap.of([indentWithTab]),
				python(),
				EditorView.editable.of(false) // Make it read-only
			]
		});

		const view = new EditorView({
			state,
			parent: viewerRef.current
		});

		viewerViewRef.current = view;

		return () => view.destroy(); // Clean up on unmount
	}, []);


	const fetchData = async () => {
		try {
			const res = await axios.get(`http://localhost:3000/api/rooms/getRoom?roomId=${roomId}`);
			setProblems(res.data.problems)
		} catch (err) {
			console.log(err.message);
		}
	};

	useEffect(() => {
		fetchData()
	}, [])


	socket.on('submit-check', (data) => {
		console.log(data, "aaaaaa")
  		if (role == "admin" && data.userId != user.uid) {
  			setSubmissions([...submissions, data])
  			console.log(submissions, "aaaa")
  			// console.log(data.selectedProblem, data.userId)
  		}
	});


	const runCode = async() => {
		if (!viewRef.current) return;
		let code = viewRef.current.state.doc.text
		let input = inputRef.current.value.split("\n")
		
		axios.post("http://localhost:3000/run", {
			language: "python",
			code,
			input
		}).then((res) => {
			setResult(res.data)
		}).catch((err) => {
			console.log(`ERROR posting code ${err}`)
		})
	}

	const handleChange = (e) => {
		setSelectedProblem(e.target.value);
		console.log("Selected:", e.target.value);
	};

	function submit() {
		let code = viewRef.current.state.doc.text
		let userId = user.uid
		socket.emit("submit", {code, selectedProblem, roomId, userId})
	}

	function check(data, index) {
		console.log(data.code)

		if (!viewerViewRef.current) return;

		const formattedCode = data.code.join("\n");
		console.log(formattedCode)

		const newState = EditorState.create({
			doc: formattedCode,
			extensions: [
				basicSetup,
				keymap.of([indentWithTab]),
				python(),
				EditorView.editable.of(false)
			]
		});

		viewerViewRef.current.setState(newState);

		axios.post("http://localhost:3000/check", {
			language: "python",
			code: data.code,
			testCases: problems[data.selectedProblem],
			selectedProblem: data.selectedProblem
		}).then((res) => {
			socket.emit("userID", {status: res.data, data})
		}).catch((err) => {
			console.log(`ERROR posting code ${err}`)
		})

		// remove submission
		setSubmissions(prev => prev.filter((_, idx) => idx !== index));
	}

	useEffect(() => {
		console.log(submitted, "xxx")
	}, [submitted])

	socket.on(user.uid, (data) => {
		console.log(`${data}`)
		setSubmitted([...submitted, {"problem": data["selectedProblem"], "status": data["status"]}])
	})

	if (role == "admin") {
		return (
			<div className={styles.container}>
					<div className={styles.topContainer}>
						<p>Room ID: {roomId}</p>
						<p>User ID: {user.uid}</p>
					</div>
					<div>
						<div>
							<label htmlFor="hr">Hour/s: </label>
							<input id="hr"/>
						</div>
						<div>
							<label htmlFor="min">Minute/s: </label>
							<input id="min"/>
						</div>
						<div>
							<label htmlFor="sec">Second/s: </label>
							<input id="sec"/>
						</div>
						<button>Start Timer</button>
					</div>
					<div className={styles.mainContainer}>
						<div className={styles.membersContainer}>
							<h1>Submissions</h1>
							<div className={styles.sidebarMembers}>
								{submissions && submissions.length > 0 ? (
									<div className={styles.member}>
										{submissions.map((submission, index) => (
											<div key={index}>
												<p>User ID: {submission.userId}</p>
												<p>Problem: {submission.selectedProblem}</p>
												<button onClick={() => check(submissions[index], index)}>Check</button>
											</div>
										))}
									</div>
								) : null}
							</div>
						</div>

						<div className={styles.editorContainer}>
							<div ref={viewerRef} className={styles.codeEditor} id="code-editor"/>
							{/*<button className={styles.runBtn} onClick={runCode}>Run</button>*/}
						</div>

						<div className={styles.statusContainer}>
							{Object.keys(problems).map((problem) => {
								const testCase = problems[problem];
								return(
									<div key={problem}>
										<h2>{problem}</h2>
										{Object.keys(testCase).map((index) => {
										  const currentTestCase = testCase[index];

										  if (!currentTestCase) {
										    return null;
										  }

										  return (
										    <div key={index}>
										      <p>Test Case: {Number(index) + 1}</p>
										      <pre>{currentTestCase.input}</pre>
										      <pre>{currentTestCase.output}</pre>
										    </div>
										  );
										})}
									</div>
								)
							})}
						</div>
					</div>
					</div>
		)
	} else {
		return (
			<div className={styles.container}>
					<div className={styles.topContainer}>
						<p>{user.uid}</p>
						<p>Timer</p>
						<p>score</p>
					</div>
					<div className={styles.mainContainer}>
						<div className={styles.membersContainer}>
							<p>{roomId}</p>
							<div className={styles.sidebarMembers}>
								<div className={styles.member}>
									<p>username1 | points</p>
									<button>attack</button>
								</div>
							</div>
						</div>
						<div className={styles.editorContainer}>
							<p>main code editor</p>
							<div ref={editorRef} className={styles.codeEditor} id="code-editor"/>
							<div className={styles.inputOutput}>
								<div>
									<p>Input:</p>
									<textarea ref={inputRef} className={styles.inputEditor} />
								</div>
								<div>
									<p>Output:</p>
									<div className={styles.outputArea}>{result}</div>
								</div>
							</div>
							<button className={styles.runBtn} onClick={runCode}>Run</button>
						</div>
						<div className={styles.statusContainer}>
							<select value={selectedProblem} onChange={handleChange}>
								{problems && Object.keys(problems).map((key, idx) => (
									<option key={idx} value={key}>
										{key}
									</option>
								))}
							</select>
							<button onClick={submit}>Submit</button>
							<p>Submissions</p>
							<div className={styles.submissionArea}>
								{submitted ? 
									submitted.map((sub, idx) => {
										return (
											<p key={idx}>{sub.problem} | {sub.status}</p>
										)
									})
								: null}
							</div>
						</div>
					</div>
				</div>
		)
	}
}

export default Room;