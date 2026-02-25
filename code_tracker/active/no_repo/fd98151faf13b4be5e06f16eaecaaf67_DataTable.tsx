öN
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    type SortingState,
    getSortedRowModel,
    type VisibilityState,
    getFilteredRowModel,
    type ColumnFiltersState,
    useReactTable,
    getPaginationRowModel,
    type RowSelectionState,
    getExpandedRowModel,
    type ExpandedState,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    rowSelection?: RowSelectionState
    onRowSelectionChange?: (value: RowSelectionState) => void
    renderSubComponent?: (props: { row: any }) => React.ReactNode
}

export function DataTable<TData, TValue>({
    columns,
    data,
    rowSelection: externalRowSelection,
    onRowSelectionChange: externalSetRowSelection,
    renderSubComponent,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({})
    const [expanded, setExpanded] = useState<ExpandedState>({})

    const rowSelection = externalRowSelection ?? internalRowSelection
    const setRowSelection = (updaterOrValue: any) => {
        const newValue = typeof updaterOrValue === 'function'
            ? updaterOrValue(rowSelection)
            : updaterOrValue

        if (externalSetRowSelection) {
            externalSetRowSelection(newValue)
        } else {
            setInternalRowSelection(newValue)
        }
    }

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getExpandedRowModel: getExpandedRowModel(),
        onExpandedChange: setExpanded,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            expanded,
        },
    })

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <>
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className={renderSubComponent ? "cursor-pointer hover:bg-muted/50" : ""}
                                        onClick={renderSubComponent ? () => row.toggleExpanded() : undefined}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {row.getIsExpanded() && renderSubComponent && (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="p-0 bg-muted/30">
                                                {renderSubComponent({ row })}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

 *cascade08*cascade08L *cascade08LQ*cascade08Q| *cascade08|*cascade08° *cascade08°µ*cascade08µÏ *cascade08Ïû *cascade08ûş *cascade08şƒ*cascade08ƒ˜ *cascade08˜Ë*cascade08Ëô *cascade08
ôˆ ˆ¥*cascade08
¥Ë ËÍ*cascade08ÍÎ *cascade08ÎĞ*cascade08ĞÑ *cascade08ÑÒ*cascade08ÒÜ *cascade08Üİ*cascade08İŞ *cascade08Şà*cascade08àä *cascade08äš*cascade08šœ *cascade08œë*cascade08ëñ *cascade08ñ*cascade08 *cascade08š*cascade08šœ *cascade08œ„*cascade08„í *cascade08íĞ *cascade08ĞÒ*cascade08ÒÓ *cascade08ÓÕ*cascade08ÕÖ *cascade08ÖÜ*cascade08Üİ *cascade08İá*cascade08áç *cascade08çê*cascade08êë *cascade08ëğ*cascade08ğñ *cascade08ñù*cascade08ùû *cascade08ûü*cascade08üş *cascade08ş†*cascade08†‡ *cascade08‡’*cascade08’• *cascade08•ß *cascade08ß¼	*cascade08¼	Õ	*cascade08Õ	„
 *cascade08„
æ *cascade08æê*cascade08êë *cascade08ëï*cascade08ïÿ *cascade08ÿ‡*cascade08‡¶ *cascade08¶¸ *cascade08¸ù*cascade08ù­ *cascade08­» *cascade08»Ø *cascade08Ø *cascade08Ş*cascade08ŞÜ *cascade08Üó*cascade08óü *cascade08ü’  *cascade08’ º *cascade08º Ä  *cascade08Ä È *cascade08È ú  *cascade08ú ş *cascade08ş ò! *cascade08ò!#*cascade08## *cascade08#±#*cascade08±#×# *cascade08×#‚$*cascade08‚$ª$ *cascade08ª$¬$*cascade08¬$Ô$ *cascade08Ô$Ö$*cascade08Ö$% *cascade08%¡%*cascade08¡%¯% *cascade08¯%³%*cascade08³%°& *cascade08°&´&*cascade08´&Ç& *cascade08Ç&É&*cascade08É&õ& *cascade08õ&÷&*cascade08÷&û& *cascade08û&ÿ&*cascade08ÿ&Ù' *cascade08Ù'İ'*cascade08İ'â' *cascade08â'æ'*cascade08æ'“( *cascade08“(•,*cascade08•,õ0 *cascade08õ0ú0*cascade08ú0›1 *cascade08›1¿1*cascade08¿1Á1 *cascade08Á1ç1*cascade08ç1è1 *cascade08è12*cascade082‚2 *cascade08‚2’2*cascade08’2“2 *cascade08“2Ÿ2*cascade08Ÿ2µ2 *cascade08µ2·2*cascade08·2¸2 *cascade08¸2Ä2*cascade08Ä2Å2 *cascade08Å2„3*cascade08„3…3 *cascade08…3 3*cascade08 3¡3 *cascade08¡3¶3*cascade08¶3¸3 *cascade08¸3÷3*cascade08÷3ù3 *cascade08ù3ú3*cascade08ú3û3 *cascade08û3ş3*cascade08ş3ÿ3 *cascade08ÿ3†4*cascade08†4‡4 *cascade08‡4ˆ4*cascade08ˆ4‰4 *cascade08‰4”4*cascade08”4•4 *cascade08•4–4*cascade08–4¨4 *cascade08¨4¬4*cascade08¬4¶4*cascade08¶4·4 *cascade08·4»4*cascade08»4¾4 *cascade08¾4Ã4*cascade08Ã4Å4 *cascade08Å4Ñ4*cascade08Ñ4Ò4 *cascade08Ò4ä4*cascade08ä4æ4 *cascade08æ4ê4*cascade08ê4ú4 *cascade08ú4Æ5*cascade08Æ5È5 *cascade08È5ö5*cascade08ö5÷5 *cascade08÷5ÿ5*cascade08ÿ5‚6 *cascade08‚6‡6*cascade08‡6Œ6 *cascade08Œ6¯6*cascade08¯6µ6 *cascade08µ6¶6*cascade08¶6·6 *cascade08·6¸6*cascade08¸6¼6 *cascade08¼6À6*cascade08À6Á6 *cascade08Á6Í6*cascade08Í6Î6 *cascade08Î6î6*cascade08î67 *cascade087…7*cascade08…7±7*cascade08±7²7 *cascade08²7º7*cascade08º7»7 *cascade08»7½7*cascade08½7¾7 *cascade08¾7€8*cascade08€88 *cascade088ƒ8*cascade08ƒ8„8 *cascade08„8‡8*cascade08‡8ˆ8 *cascade08ˆ8Š8*cascade08Š8•8 *cascade08•8—8*cascade08—8˜8 *cascade08˜8¡8*cascade08¡8¢8 *cascade08¢8«8*cascade08«8¬8 *cascade08¬8­8*cascade08­8®8 *cascade08®8ˆ9*cascade08ˆ9‰9 *cascade08‰99*cascade0899 *cascade089Ø9*cascade08Ø9Û9 *cascade08Û9ä9*cascade08ä9å9 *cascade08å9Æ;*cascade08Æ;Ú; *cascade08Ú;Ş; *cascade08Ş;Ğ<*cascade08Ğ<Û< *cascade08Û<æ<*cascade08æ<ç< *cascade08ç<é<*cascade08é<ê< *cascade08ê<ë<*cascade08ë<ì< *cascade08ì<ò<*cascade08ò<ó< *cascade08ó<ù<*cascade08ù<ú< *cascade08ú<û<*cascade08û<ü< *cascade08ü<‚=*cascade08‚=ƒ= *cascade08ƒ==*cascade08=‘= *cascade08‘=’=*cascade08’=“= *cascade08“=•=*cascade08•=–= *cascade08–=—=*cascade08—=˜= *cascade08˜=Ñ=*cascade08Ñ=Ö= *cascade08Ö=…>*cascade08…>†> *cascade08†>Œ>*cascade08Œ>> *cascade08>’>*cascade08’>“> *cascade08“>”>*cascade08”>•> *cascade08•>–>*cascade08–>˜> *cascade08˜>™>*cascade08™>š> *cascade08š>¢>*cascade08¢>£> *cascade08£>·>*cascade08·>¸> *cascade08¸>î>*cascade08î>ğ> *cascade08ğ>ò>*cascade08ò>ó> *cascade08ó>ø>*cascade08ø>ú> *cascade08ú>’?*cascade08’?“? *cascade08“?›?*cascade08›?œ? *cascade08œ?»?*cascade08»?¼? *cascade08¼?½?*cascade08½?¾? *cascade08¾?Ä?*cascade08Ä?Å? *cascade08Å?ø?*cascade08ø?ú? *cascade08ú?…@*cascade08…@†@ *cascade08†@Œ@*cascade08Œ@@ *cascade08@³@*cascade08³@µ@ *cascade08µ@¹@*cascade08¹@º@ *cascade08º@Ä@*cascade08Ä@Æ@ *cascade08Æ@Í@*cascade08Í@Ï@ *cascade08Ï@ü@*cascade08ü@ı@ *cascade08ı@ş@*cascade08ş@€A *cascade08€A†A*cascade08†A‡A *cascade08‡A—A*cascade08—A™A *cascade08™A¡A*cascade08¡A¥A*cascade08¥AÈA *cascade08ÈAŸB*cascade08ŸB§B *cascade08§B¨B*cascade08¨B¿B *cascade08¿BĞB*cascade08ĞBÑB *cascade08ÑBáB*cascade08áBåB *cascade08åBƒC*cascade08ƒC„C *cascade08„C§C*cascade08§C¨C *cascade08¨C©C*cascade08©C«C *cascade08«C®C*cascade08®C±C *cascade08±C²C*cascade08²C´C *cascade08´CàC*cascade08àCáC *cascade08áCéC*cascade08éCêC *cascade08êC”D*cascade08”D•D *cascade08•DŸD*cascade08ŸD D *cascade08 D£D*cascade08£D¥D *cascade08¥D©D*cascade08©DªD *cascade08ªDÖD*cascade08ÖD×D *cascade08×DãD*cascade08ãDäD *cascade08äDëD*cascade08ëDìD *cascade08ìD«E*cascade08«E¬E *cascade08¬E±E*cascade08±E³E *cascade08³E¸E*cascade08¸E¹E *cascade08¹E½E*cascade08½E¾E *cascade08¾EÂE*cascade08ÂEÃE *cascade08ÃEÆE*cascade08ÆEÇE *cascade08ÇEØE*cascade08ØEÙE *cascade08ÙEİE*cascade08İEñE *cascade08ñEôE *cascade08ôEÿE*cascade08ÿEF *cascade08F‚F*cascade08‚FƒF *cascade08ƒFF*cascade08FF *cascade08FŸF*cascade08ŸF¡F *cascade08¡F©F*cascade08©FÄF *cascade08ÄFÊF*cascade08ÊFÎF*cascade08ÎFÚF *cascade08ÚFÜF*cascade08ÜFåF *cascade08åFíF*cascade08íFşF *cascade08şFG *cascade08G”G *cascade08”GšG*cascade08šGG*cascade08G®G *cascade08®G³G*cascade08³G´G *cascade08´G¸G*cascade08¸G»G *cascade08»GÆG*cascade08ÆGÉG *cascade08ÉGĞG*cascade08ĞGãG *cascade08ãGäG *cascade08äGåG*cascade08åG‡H *cascade08‡HH*cascade08H‘H *cascade08‘HÓH *cascade08ÓH×H *cascade08×HÛH*cascade08ÛH„I*cascade08„II *cascade08II*cascade08I‘I *cascade08‘I’I*cascade08’I“I *cascade08“IšI*cascade08šIœI *cascade08œIÑI*cascade08ÑIÒI *cascade08ÒIÜI*cascade08ÜIİI *cascade08İIŞI*cascade08ŞIßI *cascade08ßIJ*cascade08JJ *cascade08JJ*cascade08J’J *cascade08’JœJ*cascade08œJJ *cascade08J¯J*cascade08¯J±J *cascade08±J²J*cascade08²J´J *cascade08´JÑJ*cascade08ÑJÒJ *cascade08ÒJÓJ*cascade08ÓJÔJ *cascade08ÔJÕJ*cascade08ÕJÖJ *cascade08ÖJ×J*cascade08×JØJ *cascade08ØJÛJ*cascade08ÛJŞJ *cascade08ŞJõJ*cascade08õJöJ *cascade08öJŒK*cascade08ŒKK *cascade08KK*cascade08K‘K *cascade08‘K›K*cascade08›KK *cascade08KK*cascade08KŸK *cascade08ŸK¤K*cascade08¤K¥K *cascade08¥KÅK*cascade08ÅKÆK *cascade08ÆKÈK*cascade08ÈKÉK *cascade08ÉKÊK*cascade08ÊKÌK *cascade08ÌKĞK*cascade08ĞKÑK *cascade08ÑKÛK*cascade08ÛKİK *cascade08İKäK*cascade08äKæK *cascade08æKçK*cascade08çKèK *cascade08èKüK*cascade08üKıK *cascade08ıK£L*cascade08£L¥L *cascade08¥L«L*cascade08«L¬L *cascade08¬LÁL*cascade08ÁLÃL *cascade08ÃLËL*cascade08ËLÏL*cascade08ÏLÛL *cascade08ÛLŞL *cascade08ŞLßL*cascade08ßLñL *cascade08ñLóL *cascade08óL…M*cascade08…M†M *cascade08†MˆM*cascade08ˆM‰M *cascade08‰M—M*cascade08—M˜M *cascade08˜MªM*cascade08ªM¬M *cascade08¬M´M*cascade08´MĞM *cascade08ĞMÑM*cascade08ÑMéM *cascade08éM„N*cascade08„N…N *cascade08…N‹N*cascade08‹NN *cascade08N¢N*cascade08¢N¤N *cascade08¤N¥N*cascade08¥N¦N *cascade08¦N§N*cascade08§N¨N *cascade08¨N«N*cascade08«N¬N *cascade08¬NÀN *cascade08ÀNÃN*cascade08ÃNòN *cascade08òNôN*cascade08ôNöN *cascade082Ifile:///c:/SCOUTNEW/scout_db/frontend/src/components/shared/DataTable.tsx