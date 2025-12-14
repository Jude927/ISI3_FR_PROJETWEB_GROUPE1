//Utilisation
import { Peer } from "peerjs";

//Creation objet
const peer = new Peer();

//Connecter une personne
const conn = peer.connect("another-peers-id");
conn.on("open", () => {
	conn.send("Bonjour !");
});

//Recevoir reponse
peer.on("connection", (conn) => {
	conn.on("data", (data) => {
		console.log(data);
	});
	conn.on("open", () => {
		conn.send("Bonjour!");
	});
});

//Initier un appel
navigator.mediaDevices.getUserMedia(
	{ video: true, audio: true },
	(stream) => {
		const call = peer.call("another-peers-id", stream);
		call.on("stream", (remoteStream) => {
		});
	},
	(err) => {
		console.error("Failed to get local stream", err);
	},
);

//Reponse de l'appel
peer.on("call", (call) => {
	navigator.mediaDevices.getUserMedia(
		{ video: true, audio: true },
		(stream) => {
			call.answer(stream); 
			call.on("stream", (remoteStream) => {
			});
		},
		(err) => {
			console.error("Failed to get local stream", err);
		},
	);
});