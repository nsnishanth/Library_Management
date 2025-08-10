// frontend/src/client/backend-api/user.js
const UserApi = {
  borrowBook: async (isbn, userId) => {
    const res = await fetch("/v1/user/borrow", {
      method: "POST",
      body: JSON.stringify({ isbn, userId }),
      headers: { "Content-Type": "application/json" },
    })
    return res.json()
  },
  returnBook: async (isbn, userId) => {
    const res = await fetch("/v1/user/return", {
      method: "POST",
      body: JSON.stringify({ isbn, userId }),
      headers: { "Content-Type": "application/json" },
    })
    return res.json()
  },
  getBorrowBook: async () => {
    const res = await fetch("/v1/user/borrowed-books", { method: "GET" })
    return res.json()
  },
  login: async (username, password) => {
    const res = await fetch("/v1/user/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    })
    return res.json()
  },
  getBorrowedBookUserIds: async () => {
    try {
      const res = await fetch("/v1/borrowed-books/user-id", { method: "GET" })

      if (!res.ok) {
        console.error(`Failed to fetch user IDs: ${res.status} - ${res.statusText}`)
        return []
      }

      const data = await res.json()

      if (data && Array.isArray(data.userIds)) {
        return data.userIds // Return the user IDs array
      } else {
        console.error("Unexpected response structure:", data)
        return []
      }
    } catch (error) {
      console.error("Error fetching borrowed book user IDs:", error)
      return []
    }
  },

  getProfile: async () => {
    const res = await fetch("/v1/user/profile", { method: "GET" })
    return res.json()
  },
  logout: async () => {
    const res = await fetch("/v1/user/logout", { method: "GET" })
    return res.json()
  },
}

module.exports = { UserApi }
