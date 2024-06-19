import { useState } from "react";
import {
  Button,
  Input,
  FormLabel,
  Heading,
  Grid,
  Box,
  Container,
  GridItem,
} from "@chakra-ui/react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { BiClipboard, BiPhoneCall, BiPhoneOff } from "react-icons/bi";
import { useSocketContext } from "@src/context/Context";

const Options = () => {
  const { me, callAccepted, name, setName, callEnded, leaveCall, callUser } =
    useSocketContext();
  const [idToCall, setIdToCall] = useState("");

  return (
    <Container maxW="1200px" m="35px 0" p="0">
      <Box p="10px" border="2px" borderColor="black" borderStyle="solid">
        <form
          style={{ display: "flex", flexDirection: "column" }}
          noValidate
          aria-autocomplete="none"
        >
          <Grid templateColumns="repeat(2, 1fr)" mt="12">
            <GridItem>
              <Box p="6">
                <Heading as="h6"> Account Info </Heading>
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  width="100%"
                />
                <CopyToClipboard text={me}>
                  <Button
                    leftIcon={<BiClipboard />}
                    colorScheme="teal"
                    variant="solid"
                    aria-label={me}
                    mt="20"
                  >
                    Copy ID
                  </Button>
                </CopyToClipboard>
              </Box>
            </GridItem>
            <GridItem>
              <Box p="6">
                <Heading as="h6"> Make a Call </Heading>
                <FormLabel> User id to call </FormLabel>
                <Input
                  type="text"
                  value={idToCall}
                  onChange={(e) => {
                    console.log(e.target.value);
                    setIdToCall(e.target.value);
                  }}
                  width="100%"
                />
                {callAccepted && !callEnded ? (
                  <Button
                    leftIcon={<BiPhoneOff />}
                    onClick={leaveCall}
                    mt="20"
                    colorScheme="teal"
                    variant="info"
                  >
                    Hang up
                  </Button>
                ) : (
                  <Button
                    leftIcon={<BiPhoneCall />}
                    onClick={() => callUser(idToCall)}
                    mt="20"
                    colorScheme="teal"
                    variant="solid"
                  >
                    Call
                  </Button>
                )}
              </Box>
            </GridItem>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};
export default Options;
