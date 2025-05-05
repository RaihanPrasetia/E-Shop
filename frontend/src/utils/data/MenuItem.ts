// data/menuItems.ts
import {
  BiHome,
  BiShoppingBag,
  BiListUl,
  BiTag,
  BiClipboard,
  BiFile,
  BiBarChartAlt2,
  BiUser,
  BiStore,
} from "react-icons/bi";
import { MenuItemType } from "../types/MenuTypes";

// Function to get menu items based on user role
export const getMenuItems = (): MenuItemType[] => {
  const userRole = localStorage.getItem("role");

  const baseMenuItems: MenuItemType[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: BiHome },
    {
      name: "Product Setting",
      href: "/products",
      icon: BiShoppingBag,
      subMenu: [
        { name: "Product", href: "/admin/product", icon: BiListUl },
        { name: "Category", href: "/admin/category", icon: BiTag },
      ],
    },
    {
      name: "History",
      href: "/history",
      icon: BiClipboard,
      subMenu: [
        ...(userRole === "admin"
          ? [{ name: "Audits", href: "/admin/history/audit", icon: BiFile }]
          : []),
        {
          name: "Payment",
          href: "/admin/history/payment",
          icon: BiBarChartAlt2,
        },
      ],
    },
    { name: "Store", href: "/admin/store", icon: BiStore },
  ];

  // Add User menu only for admin role
  if (userRole === "admin") {
    baseMenuItems.splice(3, 0, {
      name: "User",
      href: "/admin/user",
      icon: BiUser,
    });
  }

  return baseMenuItems;
};
