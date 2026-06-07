import React, { useState } from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { Sidebar } from '../components/Dashboard/Sidebar';
import { Topbar } from '../components/Dashboard/Topbar';
import { FileList } from '../components/Dashboard/FileList';
import { BucketsTable } from '../components/Dashboard/BucketsTable';
import { DetailPanel } from '../components/Dashboard/DetailPanel';
import { BucketModal } from '../components/Dashboard/BucketModal';
import { UploadModal } from '../components/Dashboard/UploadModal';
import { DeleteModal } from '../components/Dashboard/DeleteModal';
import { ToastContainer, ToastProps } from '../components/Dashboard/ToastContainer';

export const Dashboard: React.FC = () => {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'activity' | 'comments' | 'versions'>('activity');
    const [currentBucket, setCurrentBucket] = useState('');

    // Modals state
    const [isCreateBucketOpen, setIsCreateBucketOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const handleCreateBucket = (name: string) => {
        console.log("Create bucket", name);
        setIsCreateBucketOpen(false);
    };

    const handleUpload = (file: File, key: string) => {
        console.log("Upload", file, key);
        setIsUploadOpen(false);
    };

    const handleDelete = () => {
        console.log("Delete");
        setIsDeleteOpen(false);
    };

    const sidebar = (
        <Sidebar
            userName="John Doe"
            storageUsedGB={42}
            storageTotalGB={256}
            onExploreBucket={(name) => setCurrentBucket(name)}
            onLogout={() => { setCurrentBucket(''); console.log('Logout'); }}
        />
    );

    const topbar = (
        <Topbar
            onFiles={() => console.log('Files clicked')}
            onActivities={() => console.log('Activities clicked')}
            onSearch={(q) => console.log('Search', q)}
            onRefresh={() => console.log('Refresh')}
            onUpload={() => setIsUploadOpen(true)}
            onCreateBucket={() => setIsCreateBucketOpen(true)}
            showUpload={!!currentBucket}
        />
    );

    const fileBrowser = (
        <div className="file-browser">
            <div className="quick-access-bar">
                <div className="qa-header">
                    <span className="qa-title">Quick Access</span>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.2" fill="#9ba0b0" /><circle cx="12" cy="12" r="1.2" fill="#9ba0b0" /><circle cx="12" cy="19" r="1.2" fill="#9ba0b0" /></svg>
                </div>
                <div className="qa-cards" id="qaCards">
                    <div className="empty-state" style={{ padding: '8px 0 4px', alignItems: 'flex-start', gap: '4px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Enter a bucket name to explore it</div>
                    </div>
                </div>
            </div>

            <FileList
                onAllVersions={() => { }}
                onFilter={() => { }}
                onRefresh={() => { }}
            />
            <BucketsTable />
        </div>
    );

    const detailPanel = isDetailOpen ? (
        <DetailPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onClose={() => setIsDetailOpen(false)}
        />
    ) : null;

    const modals = (
        <>
            <BucketModal
                isOpen={isCreateBucketOpen}
                onClose={() => setIsCreateBucketOpen(false)}
                onCreate={handleCreateBucket}
            />
            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUpload={handleUpload}
            />
            <DeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
            />
        </>
    );

    return (
        <DashboardLayout
            sidebar={sidebar}
            topbar={topbar}
            fileBrowser={fileBrowser}
            detailPanel={detailPanel}
            modals={modals}
            toasts={<ToastContainer toasts={toasts} />}
        />
    );
};

export default Dashboard;
