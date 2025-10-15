import React, { useState,useRef, useMemo } from 'react';
import { Search, Plus, Filter, Edit, Trash2, Eye, AlertTriangle, Calendar, Globe, Phone, FileText, ChevronDown, ChevronRight, User, Shield, Clock } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import PassengerModal from '../components/PassengerModal';
import { motion } from 'framer-motion';
import * as XLSX from "xlsx"; 
import {CreatePassengerRequest, passengerService} from "../services/Api";
import Papa from "papaparse";
import { useLanguage } from '../contexts/LanguageContext';


function Passengers() {
  const {  searchPassengers, deletePassenger, addPassenger, updatePassenger, passengers} = useData();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const {t} = useLanguage();
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    banDuration: '',
    nationality: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState<number>(1);;
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);;
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    passenger?: any;
  }>({ isOpen: false, mode: 'create' });

  const [deleteModal, setDeleteModal] = useState<{
  isOpen: boolean;
  passengerId?: string;}>({ isOpen: false });
  
  const [exportFormat, setexportFormat]= useState<"csv"|"excel">("csv");
  const filteredPassengers = searchPassengers(searchQuery, filters);
  const totalPages = Math.ceil(filteredPassengers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const toggleRowExpansion = (passengerId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(passengerId)) {
      newExpandedRows.delete(passengerId);
    } else {
      newExpandedRows.add(passengerId);
    }
    setExpandedRows(newExpandedRows);
  };


  const handlePageChange = (newPage:number) => {
  if (newPage < 1 || newPage > totalPages) return;
  setCurrentPage(newPage);
};

const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setItemsPerPage(parseInt(e.target.value));
  setCurrentPage(1); 
};

const paginatedPassengers = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return filteredPassengers.slice(startIndex, startIndex + itemsPerPage);
}, [filteredPassengers, currentPage, itemsPerPage]);

  const severityColors = {
    LOW: 'bg-green-100 text-green-800 border-green-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    CRITICAL: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusColors = {
    ACTIVE: 'bg-red-100 text-red-800',
    EXPIRED: 'bg-gray-100 text-gray-800',
    UNDER_REVIEW: 'bg-blue-100 text-blue-800'
  };

 const handleDelete = (id: string) => {
  setDeleteModal({ isOpen: true, passengerId: id });
};
const confirmDelete = () => {
  if (deleteModal.passengerId) {
    deletePassenger(deleteModal.passengerId);
    setDeleteModal({ isOpen: false });
  }
};
const cancelDelete = () => {
  setDeleteModal({ isOpen: false });
};

  const handleModalSave = async (passengerData: any) => {
    try {
      if (modalState.mode === 'create') {
        addPassenger(passengerData);
        alert('Passenger added successfully')
      } else if (modalState.mode === 'edit' && modalState.passenger) {
        updatePassenger(modalState.passenger.id,passengerData);
        alert('update completed successfully')
      }
    } catch (error) {
      alert('An error occurred while saving'+error);
    }
  };

  const openModal = (mode: 'create' | 'edit' | 'view', passenger?: any) => {
    setModalState({ isOpen: true, mode, passenger });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'create', passenger: undefined });
  };

   // Export CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Last Name', 'First Name', 'Email', 'Phone Number', 'Passeport', 'Nationality', 'Reason for ban', 'Date of ban', 'Severity'].join(','),
      ...filteredPassengers.map(p => [
        p.firstName, p.lastName, p.email, p.phone, p.passportNumber,
        p.nationality, p.banReason, p.banDate, p.severity
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'banned passengers.csv';
    a.click();
  };

  // Export Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPassengers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Passengers");
    XLSX.writeFile(workbook, "banned passengers.xlsx");
  };

  // Gestion export selon format choisi
  const handleExport = () => {
    if (exportFormat === "csv") {
      exportToCSV();
    } else {
      exportToExcel();
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileUpload =(event:React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return alert("Please select a CSV or Excel file.");
    
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileExtension === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          const data: CreatePassengerRequest[] = results.data as CreatePassengerRequest[];
          saveToDatabase(data);
        },
      });
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: CreatePassengerRequest[] = XLSX.utils.sheet_to_json(worksheet);
        saveToDatabase(jsonData);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Format not supported. Please choose a CSV or Excel file.");
    }
  };

  const saveToDatabase = async (passengers: CreatePassengerRequest[]) => {
    try {
      for (const passenger of passengers) {
        try {
          await passengerService.createPassenger(passenger);
        } catch (err) {
          console.error(`Error importing passenger ${passenger.firstName} ${passenger.lastName}`, err);
        }
      }
      alert("Import completed ✅");
    } catch (error) {
      console.error("Erreur générale:", error);
      alert("Unable to communicate with the server ❌");
    }
  };
  const listNationalite = Array.from(new Set(passengers.map(p => p.nationality))).sort() ;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div 
      initial = {{opacity:0, y:20}} 
      animate = {{opacity:1, y:0}}
      transition={{duration: 0.8}}          
       className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white ">{t('passengers.title')}</h1>
            <p className="text-gray-600 mt-2 dark:text-white">{t('passengers.subtitle')}</p>
          </div>
          {isAdmin && (
            <div className="flex space-x-3">
            <button
              onClick={handleClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('passenger.importer')}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />
               {/*  Select pour choisir CSV ou Excel */}
              <select
                value={exportFormat}
                onChange={(e) => setexportFormat(e.target.value as "csv" | "excel")}
                className="border border-gray-300 rounded-lg px-2 py-1"
              >
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
              </select>

              <button 
                onClick={handleExport}
                className="bg-asky-orange-600 hover:bg-asky-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FileText className="h-5 w-5" />
                <span>{t('passenger.exporter')}</span>
              </button>
              <button 
                onClick={() => openModal('create')}
                className="bg-asky-brown-600 hover:bg-asky-brown-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>{t('passengers.add')}</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Barre de recherche et filtres */}
      <motion.div
       initial ={{opacity:0, y:30}}
       animate = {{opacity: 1, y:0}}
       transition={{duration:1}}
       className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('passengers.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 focus:border-asky-orange-500"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-5 w-5" />
            <span>{t('passengers.filters')}</span>
          </button>
        </div>

        {showFilters && (
          <motion.div 
          initial ={{opacity:0, y:-30}}
          animate = {{opacity: 1, y:0}}
          transition={{duration:1}}
          className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('passengers.severity')}</label>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters({...filters, severity: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                >
                  <option value="">{t('passengers.all')}</option>
                  <option value="LOW">{t('dashboard.low')}</option>
                  <option value="MEDIUM">{t('dashboard.medium')}</option>
                  <option value="HIGH">{t('dashboard.high')}</option>
                  <option value="CRITICAL">{t('dashboard.critical')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('passengers.status')}</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                >
                  <option value="">{t('passengers.all')}</option>
                  <option value="ACTIVE">{t('passengers.active')}</option>
                  <option value="EXPIRED">{t('passengers.expired')}</option>
                  <option value="UNDER_REVIEW">{t('passengers.underReview')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('passengers.banDuration')}</label>
                <select
                  value={filters.banDuration}
                  onChange={(e) => setFilters({...filters, banDuration: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                >
                  <option value="">{t('passengers.all')}</option>
                  <option value="TEMPORARY">{t('passengers.temporary')}</option>
                  <option value="PERMANENT">{t('passengers.permanent')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('passengers.nationality')}</label>
                <select
                  value={filters.nationality}
                  onChange={(e) => setFilters({...filters, nationality: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                >
                <option value ="">{t('passengers.all')}</option>
                {listNationalite.map((nat) => (
                  <option key={nat} value={nat}>{nat}</option>)
                )}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
      
          <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {filteredPassengers.length} {t('passenger.passenger')}{filteredPassengers.length > 1 ? 's' : ''} {t('passenger.pfound')}{filteredPassengers.length > 1 ? 's' : ''}
          </h3>
        </div>
<motion.div
  key={currentPage}
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="sticky top-0 z-20 flex flex-col sm:flex-row justify-between items-center px-6 py-3
             bg-white/90 dark:bg-gray-800/90 backdrop-blur-md 
             border-b border-gray-200 dark:border-gray-700 shadow-sm"
>
  <div className="flex items-center space-x-2">
    <button
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-3 py-1 rounded-md bg-asky-brown-600 hover:bg-asky-brown-700 
                 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {t("passengers.previous")}
    </button>

    <span className="text-sm text-gray-700 dark:text-gray-300">
      Page {currentPage} / {totalPages}
    </span>

    <button
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="px-3 py-1 rounded-md bg-asky-orange-600 hover:bg-asky-orange-700 
                 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {t("passengers.next")}
    </button>
  </div>

  {/* --- Sélecteur du nombre d’éléments --- */}
  <div className="flex items-center mt-2 sm:mt-0 space-x-2">
    <select
      id="itemsPerPage"
      value={itemsPerPage}
      onChange={handleItemsPerPageChange}
      className="text-sm border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 
                 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:ring-asky-orange-600"
    >
      <option value={5}>5</option>
      <option value={10}>10</option>
      <option value={20}>20</option>
      <option value={50}>50</option>
      <option value={100}>100</option>
    </select>

   
  </div>
</motion.div>
      {/* Liste des passagers */}
      <motion.div
       initial ={{opacity:0, y:30}}
       animate = {{opacity: 1, y:0}}
       transition={{duration:1}}
       className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        {filteredPassengers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('passenger.passenger')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Passeport
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('passengers.nationality')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('passengers.dateban')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('passengers.severity')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('passengers.status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedPassengers.map((passenger, index) => (
                  <React.Fragment key={passenger.id}>
                    {/* Ligne principale */}
                    <motion.tr 
                    initial={{opacity:0, y:30}}
                    animate={{opacity:1,y:0}}
                    transition={{duration:0.5, delay:index*0.1}}
                    onClick={() => toggleRowExpansion(passenger.id)}
                      className={ `cursor-pointer transition-colors 
                      ${index % 2 === 0 
          ? "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700" 
          : "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700"}
                       `} >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            {expandedRows.has(passenger.id) ? (
                              <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {passenger.firstName} {passenger.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {passenger.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {passenger.passportNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {passenger.nationality}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(passenger.banDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${severityColors[passenger.severity]}`}>
                          {passenger.severity === 'CRITICAL' ? 'Critique' :
                           passenger.severity === 'HIGH' ? 'Élevé' :
                           passenger.severity === 'MEDIUM' ? 'Moyen' : 'Faible'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[passenger.status]}`}>
                          {passenger.status === 'ACTIVE' ? 'Actif' :
                           passenger.status === 'EXPIRED' ? 'Expiré' : 'En révision'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => openModal('view', passenger)}
                            className="p-2 text-gray-400 hover:text-asky-orange-600 hover:bg-asky-orange-50 dark:hover:bg-asky-orange-900/20 rounded-lg transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {isAdmin && (
                            <>
                              <button 
                                onClick={() => openModal('edit', passenger)}
                                className="p-2 text-gray-400 hover:text-asky-brown-600 hover:bg-asky-brown-50 dark:hover:bg-asky-brown-900/20 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(passenger.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>

                    {/* Ligne étendue avec détails */}
                    {expandedRows.has(passenger.id) && (
                      <motion.tr 
                      initial = {{opacity:0, y:-30}}
                      animate ={{opacity:1, y:0}}
                      transition={{duration:0.9}}
                      className="bg-gray-50 dark:bg-gray-700/50">
                        <td colSpan={7} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Informations personnelles */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                                <User className="h-4 w-4 mr-2 text-asky-orange-600" />
                                {(t('profile.personalInfo'))}
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                  <span className="text-gray-600 dark:text-gray-300">{passenger.phone}</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                  <span className="text-gray-600 dark:text-gray-300">
                                    {t('profile.nele')} {new Date(passenger.dateOfBirth).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Globe className="h-4 w-4 mr-2 text-gray-400" />
                                  <span className="text-gray-600 dark:text-gray-300">{passenger.nationality}</span>
                                </div>
                              </div>
                            </div>

                            {/* Informations du ban */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                                <Shield className="h-4 w-4 mr-2 text-red-600" />
                                {t('passengers.detailsban')}
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">{t('common.durée')}:</span>
                                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                    passenger.banDuration === 'PERMANENT' 
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                  }`}>
                                    {passenger.banDuration === 'PERMANENT' ? 'Permanent' : 'Temporaire'}
                                  </span>
                                </div>
                                {passenger.banEndDate && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Fin du ban:</span>
                                    <span className="ml-2 text-gray-600 dark:text-gray-300">
                                      {new Date(passenger.banEndDate).toLocaleDateString('fr-FR')}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Créé par:</span>
                                  <span className="ml-2 text-gray-600 dark:text-gray-300">{passenger.createdBy}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                  <span className="text-gray-600 dark:text-gray-300">
                                    {t('common.modifiéle')} {new Date(passenger.lastModified).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Raison et notes */}
                            <div className="space-y-4 md:col-span-2 lg:col-span-1">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-asky-brown-600" />
                                {t('common.raison')}
                              </h4>
                              <div className="space-y-3">
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300 block mb-1">{t('common.raison')}:</span>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                    {passenger.banReason}
                                  </p>
                                </div>
                                {passenger.notes && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300 block mb-1">Notes:</span>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                      {passenger.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('passengers.noResults')}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {searchQuery || Object.values(filters).some(f => f) 
                ? 'Essayez de modifier vos critères de recherche ou filtres.'
                : 'Aucun passager banni n\'est enregistré dans le système.'}
            </p>
          </div>
        )}
      </motion.div>

      {deleteModal.isOpen && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-red-600 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('passengers.confirmsup')}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {t('passengers.supcomfirmé')}
      </p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={confirmDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {t('common.delete')}
        </button>
        <button
          onClick={cancelDelete}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
        >
         {t('common.cancel')}
        </button>
      </div>
    </div>
  </div>
)}
      <PassengerModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleModalSave}
        passenger={modalState.passenger}
        mode={modalState.mode}
      />
    </div>
  );
}

export default Passengers;