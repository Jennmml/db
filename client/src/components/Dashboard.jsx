const Dashboard = ({ usersData })=>{
    const totalUsers = usersData.length;


    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white shadow-md p-4 rounded">
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="text-2xl font-bold">{totalUsers}</p>
        </div>
      </div>
    );
}

export default Dashboard;