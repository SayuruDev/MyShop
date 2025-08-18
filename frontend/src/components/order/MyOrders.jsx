import React, { useEffect } from "react";
import { useMyOrdersQuery } from "../../redux/api/orderApi";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";


const MyOrders = () => {
  const { data, isLoading, error } = useMyOrdersQuery();
  useEffect(() => {
    
    if (error) {
      toast.error(error?.data?.message);
    }
    }, [error]);

    if (isLoading) return <Loader />;

  return (
    <div>
     
      <h1 className="my-5">{data?.orders?.length} Orders</h1>

         </div>
  );
};

export default MyOrders;