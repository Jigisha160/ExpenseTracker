import { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts";

import { FaTrash, FaEdit, FaWindowClose } from "react-icons/fa";
import { publicRequest } from "./requestMethods";

function App() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showExpenseReport, setShowExpenseReport] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [updatedId, setUpdatedId] = useState("");
  const [updatedLabel, setUpdatedLabel] = useState("");
  const [updatedAmount, setUpdatedAmount] = useState("");
  const [updatedDate, setUpdatedDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const handleAddExpense = () => {
    setShowAddExpense(!showAddExpense);
  };
  const handleShowExpense = () => {
    setShowExpenseReport(!showExpenseReport);
  };
  const handleShowEdit = (id) => {
    setShowEdit(!showEdit);
    setUpdatedId(id)
  };
  const handleUpdateExpense = async () => {
    if (updatedId) {
      try {
        await publicRequest.put(`/expenses/${updatedId}`, {
          value: updatedAmount,
          label: updatedLabel,
          date: updatedDate
        });
        window.location.reload();
      } catch (error) {
        console.error(error);
      }
    }
  };
  

  const handleExpense = async () => {
    try {
      await publicRequest.post("/expenses", {
        label,
        value: amount,
        date,
      });
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getExpenses = async () => {
      try {
        const res = await publicRequest.get("/expenses");
        setExpenses(res.data); // Updating state with fetched data
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };
    getExpenses();
  }, []);

  const handleDelete = async (id) => {
    try {
      await publicRequest.delete(`/expenses/${id}`);
      window.location.reload()
    } catch (error) {
      console.log(error)
    }
  }
  

  return (
    <div>
      <div className="flex flex-col justify-center items-center mt-[3%] w-[80%] mr-[5%] ml-[5%]">
        <h2 className="text-xl font-semibold mb-4">Expense Breakdown</h2>
        <h1 className="text-2x; font-medium  text-[#555]">Expense Tracker</h1>
        {/* Buttons and Search Bar */}
        <div className="relative flex items-center justify-between mt-5 w-[100%]">
          <div className="relative flex justify-between w-[300px]">
            <button
              className="bg-[#af8978] p-[10px] border-none outline-none cursor-pointer text-[#fff] text-medium"
              onClick={handleAddExpense}
            >
              Add Expense
            </button>
            <button
              className="bg-blue-300 p-[10px] border-none outline-none cursor-pointer text-[#fff] text-medium"
              onClick={handleShowExpense}
            >
              Expense Report
            </button>
          </div>
          {showAddExpense && (
            <div className="absolute z-[999] flex flex-col p-[10px] top-[20px] left-0 h-[500px] w-[500px] bg-white shadow-xl">
              <FaWindowClose
                className="flex justify-end items-end text-2xl text-red-500 cursor-pointer"
                onClick={handleAddExpense}
              />
              <label htmlFor="" className="mt-[10px] font-semibold text-[18px]">
                Expense Name
              </label>
              <input
                type="text"
                placeholder="Snacks"
                className="outline-none border-2 border-[#555 ] border-solid p-[10px]"
                onChange={(e) => setLabel(e.target.value)}
              ></input>
              <label htmlFor="" className="mt-[10px] font-semibold text-[18px]">
                Expense Date
              </label>
              <input
                type="date"
                placeholder="20/05/25"
                className="outline-none border-2 border-[#555 ] border-solid p-[10px]"
                onChange={(e) => setDate(e.target.value)}
              ></input>
              <label htmlFor="" className="mt-[10px] font-semibold text-[18px]">
                Expense Amount
              </label>
              <input
                type="Number"
                placeholder="50"
                className="outline-none border-2 border-[#555 ] border-solid p-[10px]"
                onChange={(e) => setAmount(e.target.value)}
              ></input>
              <button
                className="bg-[#af8978] text-white p-[10px] border-none cursor-pointer my-[10px] "
                onClick={handleExpense}
              >
                Add Expense
              </button>
            </div>
          )}
          {showExpenseReport && (
            <div className="absolute z-[999] flex flex-col p-[10px] top-[20px] left-[100px] h-[500px] w-[500px] bg-white shadow-xl">
              <FaWindowClose
                className="flex justify-end items-end text-2xl text-red-500 cursor-pointer"
                onClick={handleShowExpense}
              />
              <PieChart
                series={[
                  {
                    data: expenses,
                    innerRadius: 30,
                    outerRadius: 100,
                    paddingAngle: 5,
                    cornerRadius: 5,
                    startAngle: -90,
                    endAngle: 180,
                    cx: 150,
                    cy: 150,
                  },
                ]}
              />
            </div>
          )}

          <div>
            <input
              type="text"
              placeholder="Search"
              className="p-[10px] w-[150px] border-2 border-[#444] border-solid"
            ></input>
          </div>
        </div>
        {/* Expense Items (Stacked in a Column) */}

        <div className="flex flex-col">
          {expenses.map((expense, index) => (
            <div
              key={index} // ✅ Add a unique key (use expense.id if available)
              className="relative flex justify-between items-center w-[80vw] h-[100px] bg-[#f3edeb] my-[20px] py-[10px]"
            >
              <h2 className="m-[20px] text-[#555] text-[18px] font-medium">
                {expense.label}
              </h2>
              <span className="m-[20px] text-[18px]">{expense.date}</span>
              <span className="m-[20px] text-[18px] font-medium">
                {expense.amount}
              </span>

              <div className="m-[20px] flex gap-4">
                <FaTrash className="text-red-500 cursor-pointer" onClick={() => handleDelete(expense._id)} />
                <FaEdit
                  className="text-[#555] cursor-pointer"
                  onClick={() => handleShowEdit(expense._id)} 
                />
              </div>
            </div>
          ))}
        </div>

        {showEdit && (
          <div className="absolute z-[999] flex flex-col p-[10px] top-[25%] right-0 h-[500px] w-[500px] bg-white shadow-xl">
            <FaWindowClose
              className="flex justify-end items-end text-2xl text-red-500 cursor-pointer"
              onClick={handleShowEdit}
            />
            <label htmlFor="" className="mt-[10px] font-semibold text-[18px]">
              Expense Name
            </label>
            <input
              type="text"
              placeholder="Snacks"
              className="outline-none border-2 border-[#555 ] border-solid p-[10px]"
              onChange={(e) => setUpdatedLabel(e.target.value)}
            ></input>
            <label htmlFor="" className="mt-[10px] font-semibold text-[18px]">
              Expense Date
            </label>
            <input
              type="date"
              placeholder="20/05/25"
              className="outline-none border-2 border-[#555 ] border-solid p-[10px]"
              onChange={(e) => setUpdatedDate(e.target.value)}
            ></input>
            <label htmlFor="" className="mt-[10px] font-semibold text-[18px]">
              Expense Amount
            </label>
            <input
              type="Number"
              placeholder="50"
              className="outline-none border-2 border-[#555 ] border-solid p-[10px]"
              onChange={(e) => setUpdatedAmount(e.target.value)}
            ></input>
            <button className="bg-[#af8978] text-white p-[10px] border-none cursor-pointer my-[10px] " onClick = {handleUpdateExpense}>
              Update Expense
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
