export default function Dashboard() {
    return (
        <main className="min-h-screen bg-gray-50 flex">

           
            <aside className="w-64 bg-white border-r min-h-screen p-5">
                
                <h1 className="text-xl font-bold text-blue-600 mb-8">
                    Cloud Media
                </h1>

                <nav className="space-y-2">
                    <button className="w-full text-left px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium">
                        My Drive
                    </button>

                    <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700">
                        Shared
                    </button>

                    <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700">
                        Starred
                    </button>

                    <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700">
                        Recent
                    </button>

                    <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700">
                        Trash
                    </button>
                </nav>

            </aside>


          
            <section className="flex-1 min-w-0">

            
                <header className="h-16 bg-white border-b px-8 flex items-center justify-between">

                    <div className="w-96">
                        <input
                            type="text"
                            placeholder="Search files and folders..."
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            User
                        </span>

                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                                       
                            U
                        </div>
                    </div>

                </header>


                {/* Content */}
                <div className="p-8">

                 
                    <div className="flex items-center justify-between mb-6">

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                My Drive
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Manage your files and folders
                            </p>
                        </div>

                        <div className="flex gap-3">

                            <button
                                className="px-4 py-2 rounded-lg bg-white border
                                           hover:bg-gray-50 transition"
                            >
                                New
                            </button>

                            <button
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white
                                           hover:bg-blue-700 transition"
                            >
                                Upload
                            </button>

                        </div>

                    </div>


                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm mb-6">

                        <button className="text-blue-600 hover:underline">
                            My Drive
                        </button>

                        <span className="text-gray-400">
                            /
                        </span>

                        <span className="text-gray-500">
                            Home
                        </span>

                    </div>


                    {/* Toolbar */}
                    <div className="bg-white border rounded-xl px-4 py-3 mb-5
                                    flex items-center justify-between">

                        <div className="text-sm text-gray-600">
                            0 items
                        </div>

                        <div className="flex items-center gap-3">

                            <button className="px-3 py-2 text-sm rounded-lg hover:bg-gray-100">
                                Sort
                            </button>

                            <button className="px-3 py-2 text-sm rounded-lg hover:bg-gray-100">
                                Grid
                            </button>

                            <button className="px-3 py-2 text-sm rounded-lg hover:bg-gray-100">
                                List
                            </button>

                        </div>

                    </div>


                    {/* Empty State */}
                    <div className="bg-white rounded-xl border min-h-[350px]
                                    flex items-center justify-center">

                        <div className="text-center">

                            <div className="text-5xl mb-4">
                                📁
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800">
                                No files or folders
                            </h3>

                            <p className="mt-2 text-gray-500">
                                Upload a file or create a folder to get started.
                            </p>

                            <div className="flex justify-center gap-3 mt-6">

                                <button
                                    className="px-4 py-2 rounded-lg border
                                               hover:bg-gray-50"
                                >
                                    New Folder
                                </button>

                                <button
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white
                                               hover:bg-blue-700"
                                >
                                    Upload File
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </section>

        </main>
    );
}