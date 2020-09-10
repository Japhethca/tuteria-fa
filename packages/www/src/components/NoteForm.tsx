import {
	Box,
	FormControl,
	Input,
	Textarea,
	Button,
	Flex,
} from "@chakra-ui/core";
import { useState, useContext } from "react";

import client from "../api/client";
import { storeContext, setNoteView } from "../store";
import { getUserfromCookie } from "../libs/cookie";
import { NOTE_LIST_VIEW, NOTE_EDIT_VIEW } from "../store/constants";

interface NoteFormProps {
	editNote?: INote;
	isEditing?: boolean;
	isViewing?: boolean;
}

const NoteForm = ({
	editNote,
	isEditing = false,
	isViewing = false,
}: NoteFormProps) => {
	const { dispatch } = useContext(storeContext);
	const [note, setNote] = useState(
		editNote ? editNote : { title: "", description: "" }
	);

	const handleChange = (e) => {
		setNote({ ...note, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (note, e) => {
		e.preventDefault();
		const user = getUserfromCookie();
		let data = user ? { ...note, user_id: user.id } : note;
		if (data.id) {
			data = note.user_id ? note : data;
			await client.put(`/notes/${data.id}`, data);
			return dispatch(setNoteView(NOTE_LIST_VIEW));
		}
		await client.post("/notes/create", data);
		return dispatch(setNoteView(NOTE_LIST_VIEW));
	};

	return (
		<Box>
			<FormControl>
				<Input
					onChange={handleChange}
					fontSize={["2xl", "2xl", "3xl"]}
					pt={[8, 8, 10]}
					pb={[8, 8, 10]}
					border="0"
					outline="0"
					boxSizing="border-box"
					type="text"
					name="title"
					placeholder="Note Title"
					mb="2"
					focusBorderColor="#fccde2"
					isDisabled={isViewing}
					value={note.title}
				/>
				<Textarea
					value={note.description}
					onChange={handleChange}
					isDisabled={isViewing}
					focusBorderColor="#fccde2"
					fontSize={["md", "xl", "xl"]}
					name="description"
					boxSizing="border-box"
					border="0"
					resize="vertical"
					height="50vh"
					mb="3"
				></Textarea>
				<Flex>
					{isViewing ? (
						<Button
							onClick={(e) => dispatch(setNoteView(NOTE_EDIT_VIEW))}
							type="submit"
							color="#fc5c9c"
							border="0"
							mr="2"
						>
							Edit
						</Button>
					) : (
						<Button
							onClick={(e) => handleSubmit(note, e)}
							type="submit"
							color="#fc5c9c"
							border="0"
							mr="2"
						>
							{isEditing ? "Update" : "Create"}
						</Button>
					)}
					<Button
						onClick={() => dispatch(setNoteView(NOTE_LIST_VIEW))}
						color="grey"
						border="0"
					>
						{isViewing ? "View Notes" : "Cancel"}
					</Button>
				</Flex>
			</FormControl>
		</Box>
	);
};

export default NoteForm;