import { Badge, Button, Divider, Input, Popover, Select, Space, Tabs, Upload } from 'antd';
import { DownloadOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Ancestry } from '../../../../models/ancestry';
import { AncestryData } from '../../../../data/ancestry-data';
import { AncestryPanel } from '../../../panels/ancestry-panel/ancestry-panel';
import { AppHeader } from '../../../panels/app-header/app-header';
import { CampaignSetting } from '../../../../models/campaign-setting';
import { CampaignSettingLogic } from '../../../../logic/campaign-setting-logic';
import { CampaignSettingPanel } from '../../../panels/campaign-setting-panel/campaign-setting-panel';
import { Career } from '../../../../models/career';
import { CareerData } from '../../../../data/career-data';
import { CareerPanel } from '../../../panels/career-panel/career-panel';
import { ClassData } from '../../../../data/class-data';
import { ClassPanel } from '../../../panels/class-panel/class-panel';
import { Complication } from '../../../../models/complication';
import { ComplicationData } from '../../../../data/complication-data';
import { ComplicationPanel } from '../../../panels/complication-panel/complication-panel';
import { Culture } from '../../../../models/culture';
import { CultureData } from '../../../../data/culture-data';
import { CulturePanel } from '../../../panels/culture-panel/culture-panel';
import { Element } from '../../../../models/element';
import { HeroClass } from '../../../../models/class';
import { Kit } from '../../../../models/kit';
import { KitData } from '../../../../data/kit-data';
import { KitPanel } from '../../../panels/kit-panel/kit-panel';
import { SelectablePanel } from '../../../controls/selectable-panel/selectable-panel';
import { Utils } from '../../../../utils/utils';
import { useState } from 'react';

import './element-list.scss';

interface Props {
	campaignSettings: CampaignSetting[];
	goHome: () => void;
	showAbout: () => void;
	viewAncestry: (ancestry: Ancestry) => void;
	viewCulture: (cultiure: Culture) => void;
	viewCareer: (career: Career) => void;
	viewClass: (heroClass: HeroClass) => void;
	viewKit: (kit: Kit) => void;
	viewComplication: (complication: Complication) => void;
	onSettingCreate: () => CampaignSetting;
	onSettingChange: (setting: CampaignSetting) => void;
	onSettingDelete: (setting: CampaignSetting) => void;
	onCreateHomebrew: (type: string, settingID: string | null) => void;
	onImportHomebrew: (type: string, settingID: string | null, element: Element) => void;
}

export const ElementListPage = (props: Props) => {
	const [ searchTerm, setSearchTerm ] = useState<string>('');
	const [ element, setElement ] = useState<string>('Ancestry');
	const [ settingID, setSettingID ] = useState<string | null>(props.campaignSettings.filter(cs => cs.isHomebrew).length > 0 ? props.campaignSettings.filter(cs => cs.isHomebrew)[0].id : null);
	const [ hiddenSettingIDs, setHiddenSettingIDs ] = useState<string[]>([]);

	const setVisibility = (setting: CampaignSetting, visible: boolean) => {
		if (visible) {
			const copy = JSON.parse(JSON.stringify(hiddenSettingIDs.filter(id => id !== setting.id))) as string[];
			setHiddenSettingIDs(copy);
		} else {
			const copy = JSON.parse(JSON.stringify(hiddenSettingIDs)) as string[];
			copy.push(setting.id);
			setHiddenSettingIDs(copy);
		}
	};

	const getSettings = () => {
		return props.campaignSettings.filter(cs => !hiddenSettingIDs.includes(cs.id));
	};

	const createSetting = () => {
		const setting = props.onSettingCreate();
		setSettingID(setting.id);
	};

	const deleteSetting = (setting: CampaignSetting) => {
		props.onSettingDelete(setting);
		if (settingID === setting.id) {
			setSettingID(null);
		}
	};

	const createHomebrew = () => {
		props.onCreateHomebrew(element, settingID);
	};

	const getAncestries = () => {
		return AncestryData
			.getAncestries(getSettings())
			.filter(item => Utils.textMatches([
				item.name,
				...item.features.map(f => f.name)
			], searchTerm));
	};

	const getCultures = () => {
		return CultureData
			.getCultures(getSettings())
			.filter(item => Utils.textMatches([
				item.name
			], searchTerm));
	};

	const getCareers = () => {
		return CareerData
			.getCareers(getSettings())
			.filter(item => Utils.textMatches([
				item.name,
				...item.features.map(f => f.name)
			], searchTerm));
	};

	const getClasses = () => {
		return ClassData
			.getClasses(getSettings())
			.filter(item => Utils.textMatches([
				item.name,
				...item.featuresByLevel.flatMap(lvl => lvl.features.map(f => f.name)),
				...item.abilities.flatMap(a => a.name),
				...item.subclasses.map(sc => sc.name),
				...item.subclasses.flatMap(sc => sc.featuresByLevel.flatMap(lvl => lvl.features.map(f => f.name)))
			], searchTerm));
	};

	const getKits = () => {
		return KitData
			.getKits(getSettings())
			.filter(item => Utils.textMatches([
				item.name,
				...item.features.map(f => f.name)
			], searchTerm));
	};

	const getComplications = () => {
		return ComplicationData
			.getComplications(getSettings())
			.filter(item => Utils.textMatches([
				item.name
			], searchTerm));
	};

	const getAncestriesSection = (list: Ancestry[]) => {
		if (list.length === 0) {
			return (
				<div className='ds-text dimmed-text'>None</div>
			);
		}

		return (
			<div className='element-section-row'>
				{
					list.map(a => {
						const item = (
							<SelectablePanel onSelect={() => props.viewAncestry(a)}>
								<AncestryPanel key={a.id} ancestry={a} />
							</SelectablePanel>
						);

						const setting = CampaignSettingLogic.getAncestrySetting(props.campaignSettings, a);
						if (setting && setting.id) {
							return (
								<div key={a.id}>
									<Badge.Ribbon text={setting.name || 'Unnamed Setting'}>
										{item}
									</Badge.Ribbon>
								</div>
							);
						}

						return (
							<div key={a.id}>
								{item}
							</div>
						);
					})
				}
			</div>
		);
	};

	const getCulturesSection = (list: Culture[]) => {
		if (list.length === 0) {
			return (
				<div className='ds-text dimmed-text'>None</div>
			);
		}

		return (
			<div className='element-section-row'>
				{
					list.map(c => {
						const item = (
							<SelectablePanel onSelect={() => props.viewCulture(c)}>
								<CulturePanel key={c.id} culture={c} />
							</SelectablePanel>
						);

						const setting = CampaignSettingLogic.getCultureSetting(props.campaignSettings, c);
						if (setting && setting.id) {
							return (
								<div key={c.id}>
									<Badge.Ribbon text={setting.name || 'Unnamed Setting'}>
										{item}
									</Badge.Ribbon>
								</div>
							);
						}

						return (
							<div key={c.id}>
								{item}
							</div>
						);
					})
				}
			</div>
		);
	};

	const getCareersSection = (list: Career[]) => {
		if (list.length === 0) {
			return (
				<div className='ds-text dimmed-text'>None</div>
			);
		}

		return (
			<div className='element-section-row'>
				{
					list.map(c => {
						const item = (
							<SelectablePanel onSelect={() => props.viewCareer(c)}>
								<CareerPanel key={c.id} career={c} />
							</SelectablePanel>
						);
						const setting = CampaignSettingLogic.getCareerSetting(props.campaignSettings, c);
						if (setting && setting.id) {
							return (
								<div key={c.id}>
									<Badge.Ribbon text={setting.name || 'Unnamed Setting'}>
										{item}
									</Badge.Ribbon>
								</div>
							);
						}

						return (
							<div key={c.id}>
								{item}
							</div>
						);
					})
				}
			</div>
		);
	};

	const getClassesSection = (list: HeroClass[]) => {
		if (list.length === 0) {
			return (
				<div className='ds-text dimmed-text'>None</div>
			);
		}

		return (
			<div className='element-section-row'>
				{
					list.map(c => {

						const item = (
							<SelectablePanel onSelect={() => props.viewClass(c)}>
								<ClassPanel key={c.id} heroClass={c} />
							</SelectablePanel>
						);
						const setting = CampaignSettingLogic.getClassSetting(props.campaignSettings, c);
						if (setting && setting.id) {
							return (
								<div key={c.id}>
									<Badge.Ribbon text={setting.name || 'Unnamed Setting'}>
										{item}
									</Badge.Ribbon>
								</div>
							);
						}

						return (
							<div key={c.id}>
								{item}
							</div>
						);
					})
				}
			</div>
		);
	};

	const getKitsSection = (list: Kit[]) => {
		if (list.length === 0) {
			return (
				<div className='ds-text dimmed-text'>None</div>
			);
		}

		return (
			<div className='element-section-row'>
				{
					list.map(k => {
						const item = (
							<SelectablePanel onSelect={() => props.viewKit(k)}>
								<KitPanel key={k.id} kit={k} />
							</SelectablePanel>
						);

						const setting = CampaignSettingLogic.getKitSetting(props.campaignSettings, k);
						if (setting && setting.id) {
							return (
								<div key={k.id}>
									<Badge.Ribbon text={setting.name || 'Unnamed Setting'}>
										{item}
									</Badge.Ribbon>
								</div>
							);
						}

						return (
							<div key={k.id}>
								{item}
							</div>
						);
					})
				}
			</div>
		);
	};

	const getComplicationsSection = (list: Complication[]) => {
		if (list.length === 0) {
			return (
				<div className='ds-text dimmed-text'>None</div>
			);
		}

		return (
			<div className='element-section-row'>
				{
					list.map(c => {
						const item = (
							<SelectablePanel onSelect={() => props.viewComplication(c)}>
								<ComplicationPanel key={c.id} complication={c} />
							</SelectablePanel>
						);

						const setting = CampaignSettingLogic.getComplicationSetting(props.campaignSettings, c);
						if (setting && setting.id) {
							return (
								<div key={c.id}>
									<Badge.Ribbon text={setting.name || 'Unnamed Setting'}>
										{item}
									</Badge.Ribbon>
								</div>
							);
						}

						return (
							<div key={c.id}>
								{item}
							</div>
						);
					})
				}
			</div>
		);
	};

	try {
		const elementOptions = [ 'Ancestry', 'Culture', 'Career', 'Class', 'Kit', 'Complication' ].map(e => ({ label: e, value: e }));
		const settingOptions = props.campaignSettings.filter(cs => cs.isHomebrew).map(cs => ({ label: cs.name || 'Unnamed Setting', value: cs.id }));

		const ancestries = getAncestries();
		const cultures = getCultures();
		const careers = getCareers();
		const classes = getClasses();
		const kits = getKits();
		const complications = getComplications();

		return (
			<div className='element-list-page'>
				<AppHeader goHome={props.goHome} showAbout={props.showAbout}>
					<Input
						placeholder='Search'
						allowClear={true}
						value={searchTerm}
						suffix={<SearchOutlined />}
						onChange={e => setSearchTerm(e.target.value)}
					/>
					<Popover
						trigger='click'
						placement='bottom'
						content={(
							<div style={{ display: 'flex', flexDirection: 'column' }}>
								<div>
									<div className='ds-text'>What do you want to add?</div>
									<Select
										style={{ width: '100%' }}
										placeholder='Select'
										options={elementOptions}
										optionRender={option => <div className='ds-text'>{option.data.label}</div>}
										value={element}
										onChange={setElement}
									/>
								</div>
								{
									settingOptions.length > 1 ?
										<div>
											<div className='ds-text'>Where do you want it to live?</div>
											<Select
												style={{ width: '100%' }}
												placeholder='Select'
												options={settingOptions}
												optionRender={option => <div className='ds-text'>{option.data.label}</div>}
												value={settingID}
												onChange={setSettingID}
											/>
										</div>
										: null
								}
								<Divider />
								<Space>
									<Button block={true} icon={<PlusCircleOutlined />} onClick={createHomebrew}>Create</Button>
									<div className='ds-text'>or</div>
									<Upload
										style={{ width: '100%' }}
										accept={`.drawsteel-${element.toLowerCase()}`}
										showUploadList={false}
										beforeUpload={file => {
											file
												.text()
												.then(json => {
													const e = (JSON.parse(json) as Element);
													props.onImportHomebrew(element, settingID, e);
												});
											return false;
										}}
									>
										<Button block={true} icon={<DownloadOutlined />}>Import</Button>
									</Upload>
								</Space>
							</div>
						)}
					>
						<Button>
							Create Homebrew Element
						</Button>
					</Popover>
					<Popover
						trigger='click'
						placement='bottom'
						content={(
							<div style={{ display: 'flex', flexDirection: 'column' }}>
								{
									props.campaignSettings.map(cs => (
										<CampaignSettingPanel
											key={cs.id}
											setting={cs}
											visible={!hiddenSettingIDs.includes(cs.id)}
											onSetVisible={setVisibility}
											onChange={props.onSettingChange}
											onDelete={deleteSetting}
										/>
									))
								}
								<Divider />
								<Button block={true} onClick={createSetting}>Create a new setting</Button>
							</div>
						)}
					>
						<Button>
							Campaign Settings
						</Button>
					</Popover>
				</AppHeader>
				<div className='element-list-page-content'>
					<Tabs
						items={[
							{
								key: '1',
								label: `Ancestries (${ancestries.length})`,
								children: getAncestriesSection(ancestries)
							},
							{
								key: '2',
								label: `Cultures (${cultures.length})`,
								children: getCulturesSection(cultures)
							},
							{
								key: '3',
								label: `Careers (${careers.length})`,
								children: getCareersSection(careers)
							},
							{
								key: '4',
								label: `Classes (${classes.length})`,
								children: getClassesSection(classes)
							},
							{
								key: '5',
								label: `Kits (${kits.length})`,
								children: getKitsSection(kits)
							},
							{
								key: '6',
								label: `Complications (${complications.length})`,
								children: getComplicationsSection(complications)
							}
						]}
					/>
				</div>
			</div>
		);
	} catch (ex) {
		console.error(ex);
		return null;
	}
};
