import React from 'react';
import { connect } from 'react-redux';
import cn from 'clsx';
import { getProject, setPinValue } from '../../../redux/modules/blynk/actions';
import styles from './styles.module.scss';
import Widget from './Widget/Widget';
import blynkWSClient from '../../../common/blynkWSClient';

export class ProjectPage extends React.Component {
    async getProject() {
        const { project, getProject, history } = this.props;
        if (!project) {
            try {
                await getProject();
            } catch (e) {
                history.push('/connection');
            }
        }
    }

    initWSClient = () => {
        const { token, serverHost, serverPort } = this.props;

        // Connect to blynk ws server
        blynkWSClient.init({
            token,
            serverHost,
            serverPort,
        });

        blynkWSClient.addEventListener('write-pin', this.handleWritePin);
    };

    componentWillUnmount() {
        blynkWSClient.removeEventListener('write-pin', this.handleWritePin);
    }

    handleWritePin = e => {
        const { setPinValue } = this.props;
        const { pin, value } = e.detail;

        setPinValue(pin, value);
    };

    componentDidMount() {
        const { token, history } = this.props;
        if (!token) {
            return history.push('/connection');
        }
        this.getProject().then(this.initWSClient);
    }

    renderWidgets() {
        const { project } = this.props;

        const widgets = [];
        project.get('widgets').map(widget => widgets.push(<Widget key={widget.get('id')} widget={widget} />));
        return widgets;
    }

    render() {
        const { project } = this.props;

        if (!project) {
            return <div />;
        }

        const isDarkTheme = project.get('theme') === 'Blynk';

        return (
            <div className={cn(styles.root, { 'bp3-dark': isDarkTheme })}>
                <div className={styles.header}>
                    <div className={styles.headerTitle}>{project.get('name')}</div>
                </div>
                <div className={styles.workspace}>
                    <div className={styles.widgetsArea}>{this.renderWidgets()}</div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        token: state.blynk.get('token'),
        serverHost: state.blynk.get('serverHost'),
        serverPort: state.blynk.get('serverPort'),

        project: state.blynk.get('project'),
    };
}

export default connect(
    mapStateToProps,
    {
        getProject,
        setPinValue,
    },
)(ProjectPage);