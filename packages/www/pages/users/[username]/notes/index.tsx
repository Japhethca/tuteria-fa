import { GetServerSideProps } from 'next';
import axios from 'axios';
import { Button, Box, Heading, useToast, Text } from '@chakra-ui/core';
import {
  Container, Layout, Nav, Note
} from '../../../../components';
import { HOST_URL, ERROR, SUCCESS } from '../../../../constants';
import { FunctionComponent } from 'react';

type Note = {
  id: string
  title: string
  description: string
  user_id: null
}

export interface UserNotesProps {
  status: string,
  username: string,
  notes: Note[]
}

export const getServerSideProps:GetServerSideProps = async ({params}) => {
  try {
    const res = await axios.get(`${HOST_URL}/api/users/${params.username}/notes`)
    const notes = res.data.data.sort((a, b) => b.id - a.id)
    return {
      props: {
        status: SUCCESS,
        username: params.username,
        notes: notes,
      },
    }
  } catch(err) {
    return {
      props: {
        status: ERROR,
        notes: [],
      },
    }
  }

}

const UserNotes: FunctionComponent<UserNotesProps> = ({status, username, notes}) => {
  const toast = useToast();

  return (
    <Layout>
      <Nav/>
      <Container>
      <Button
        leftIcon="add"
        variantColor="teal"
        borderRadius={7}
        fontSize={14}
        ml={2} mr={2} mb={3}
      >
        <a href={`/users/${username}/notes/create`}>Add Note</a>
      </Button>
      {status === ERROR ?
        toast({
          title: "An error occurred.",
          description: "Something went wrong. Try again",
          status: "error",
          position: "top",
          duration: 9000,
          isClosable: true
        }) : notes.length === 0 ?

          <Text fontSize={18} textAlign="center">
            You have not created any note. Start adding notes.
          </Text> :
          <Box>
            <Heading textAlign="center" color="#3E576A" as="h3" size="lg" mt={1} mb={2}>
              My Notes
            </Heading>
            {notes.map(({id, title}) => (
              <Note key={id} id={id} title={title} username={username}/>
            ))}
          </Box>
      }
      <Box mb={10}></Box>
      </Container>
    </Layout>
  )
}

export default UserNotes;
