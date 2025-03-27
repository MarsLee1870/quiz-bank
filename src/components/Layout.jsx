import Navbar from "./Navbar"
import { themeClasses } from "../styles/theme"

export default function Layout({ children }) {
  return (
    <div className={themeClasses.container}>
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  )
}
