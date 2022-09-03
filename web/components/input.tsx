import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";


interface Input {
    buttonText: string;
    onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;

}

export const UserSearch: React.FC<Input> = ({buttonText, onChange}: Input) => {
  return (
    <Box
      component="form"
      sx={{
        "& > :not(style)": { m: 1, width: "25ch" },
      }}
      noValidate
      autoComplete="off"
      className="flex flex-col"
    >
      <TextField onChange={onChange} id="outlined-basic" label="Search Route" variant="outlined" />
    </Box>
  );
}
