import { Grid, Box, Heading, GridItem } from "@chakra-ui/react";
import { useSocketContext } from "@src/context/Context";

const VideoPlayer = () => {
  const { name, callAccepted, myVideo, userVideo, callEnded, stream, call } =
    useSocketContext();

  return (
    <Grid justifyContent="center" templateColumns="repeat(2, 1fr)" mt="12">
      {/* my video */}
      {stream && (
        <GridItem>
          <Box>
            <Heading as="h5">{name || "Name"}</Heading>
            <video playsInline muted ref={myVideo} autoPlay width="600" />
          </Box>
        </GridItem>
      )}
      {/* user's video */}
      {callAccepted && !callEnded && (
        <GridItem>
          <Box>
            <Heading as="h5">{call.name || "Name"}</Heading>
            <video playsInline ref={userVideo} autoPlay width="600" />
          </Box>
        </GridItem>
      )}
    </Grid>
  );
};
export default VideoPlayer;
