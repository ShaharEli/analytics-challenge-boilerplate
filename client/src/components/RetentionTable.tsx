import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { weeklyRetentionObject } from "../models";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TablePagination from "@material-ui/core/TablePagination";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
export default function RetentionTable() {
  const [retention, setRetention] = useState<undefined | weeklyRetentionObject[]>(undefined);
  const [offset, setOffset] = useState<number | undefined>(undefined);
  const cells = Array(7).fill(0);
  const rows = Array(8).fill(cells);
  const getRetention = useCallback(
    async (offset) => {
      const { data } = await axios.get(`http://localhost:3001/events/retention?dayzero=${offset}`);
      setRetention(data);
    },
    [offset]
  );
  useEffect(() => {}, [offset]);
  return (
    <div>
      <TableContainer>
        <Table size="small" style={{ border: "1px solid #DDDDDD" }}>
          <TableHead>
            <TableRow style={{ background: "#f1f1f1" }}>
              <TableCell>Action</TableCell>
              {/* {HeadCells.map((cell) => {
                return (
                  <TableCell key={cell.id} sortDirection={orderBy === cell.id ? order : false}>
                      <TabelSortLabel>
                        </TabelSortLabel>
                  </TableCell>
                );
              })} */}
              <TableCell>Compare</TableCell>
            </TableRow>
            {
              // data.map( data => {
              //   return(
              //     <TableRow style={{ background: "white" }}>
              //         {/* data.map(something => return <TabelCell />) */}
              //     </TableRow>
              //   )
              // })}
            }
            {rows.map((row) => {
              return (
                <TableRow>
                  {row.map((cell: number, i: number) => (
                    <TableCell>Cell{i}</TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableHead>
        </Table>
        {/* <TablePagination
          rowsPerPageOptions={[5, 10, 15]}
          component="div"
          count={financeDataTable.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        /> */}
      </TableContainer>
    </div>
  );
}
